import Time "mo:core/Time";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Set "mo:core/Set";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Nat "mo:core/Nat";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import List "mo:core/List";

(with migration = Migration.run)
actor {
  // Initialize the access control system on canister instantiation
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  type VideoMetadata = {
    id : Text;
    title : Text;
    description : Text;
    uploader : Principal;
    uploadTime : Time.Time;
    likeCount : Nat;
    commentCount : Nat;
  };

  type PhotoMetadata = {
    id : Text;
    title : Text;
    description : Text;
    uploader : Principal;
    uploadTime : Time.Time;
  };

  type Video = {
    title : Text;
    description : Text;
    uploader : Principal;
    uploadTime : Time.Time;
    file : Storage.ExternalBlob;
    likeCount : Nat;
    commentCount : Nat;
  };

  type Photo = {
    title : Text;
    description : Text;
    uploader : Principal;
    uploadTime : Time.Time;
    file : Storage.ExternalBlob;
  };

  type Comment = {
    id : Nat;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  type Channel = {
    owner : Principal;
    channelName : Text;
  };

  public type UserProfile = {
    name : Text;
    channelName : ?Text;
  };

  let videos = Map.empty<Text, Video>();
  let photos = Map.empty<Text, Photo>();
  let comments = Map.empty<Text, [Comment]>();
  let videoLikes = Map.empty<Text, Set.Set<Principal>>();
  let channels = Map.empty<Principal, Text>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    // Anyone can view profiles, but only admins can view other users' full profiles
    // Regular users can only view their own profile details
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      // Return limited profile info for other users
      switch (userProfiles.get(user)) {
        case (null) { null };
        case (?profile) { ?{ name = profile.name; channelName = profile.channelName } };
      };
    } else {
      userProfiles.get(user);
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func uploadVideo(title : Text, description : Text, file : Storage.ExternalBlob) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload videos");
    };
    let videoId = "video_" # Time.now().toText();
    let video : Video = {
      title;
      description;
      uploader = caller;
      uploadTime = Time.now();
      file;
      likeCount = 0;
      commentCount = 0;
    };
    videos.add(videoId, video);
    videoId;
  };

  public shared ({ caller }) func uploadPhoto(title : Text, description : Text, file : Storage.ExternalBlob) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload photos");
    };
    let photoId = "photo_" # Time.now().toText();
    let photo : Photo = {
      title;
      description;
      uploader = caller;
      uploadTime = Time.now();
      file;
    };
    photos.add(photoId, photo);
    photoId;
  };

  public query ({ caller }) func getVideo(videoId : Text) : async Video {
    // Anyone can view videos
    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) { video };
    };
  };

  public query ({ caller }) func getPhoto(photoId : Text) : async Photo {
    // Anyone can view photos
    switch (photos.get(photoId)) {
      case (null) { Runtime.trap("Photo not found") };
      case (?photo) { photo };
    };
  };

  public query ({ caller }) func listVideos() : async [VideoMetadata] {
    // Anyone can list videos
    videos.entries().map(func((id, video)) { { video with id } }).toArray();
  };

  public query ({ caller }) func listPhotos() : async [PhotoMetadata] {
    // Anyone can list photos
    photos.entries().map(func((id, photo)) { { photo with id } }).toArray();
  };

  public shared ({ caller }) func likeVideo(videoId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like videos");
    };
    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?_) {
        switch (videoLikes.get(videoId)) {
          case (null) {
            let newSet = Set.singleton(caller);
            videoLikes.add(videoId, newSet);
            updateVideoLikeCount(videoId);
          };
          case (?set) {
            if (set.contains(caller)) {
              Runtime.trap("You have already liked this video");
            } else {
              set.add(caller);
              updateVideoLikeCount(videoId);
            };
          };
        };
      };
    };
  };

  func updateVideoLikeCount(videoId : Text) {
    switch (videos.get(videoId)) {
      case (null) {};
      case (?video) {
        let likeCount = switch (videoLikes.get(videoId)) {
          case (null) { 0 };
          case (?set) { set.size() };
        };
        let updatedVideo = { video with likeCount };
        videos.add(videoId, updatedVideo);
      };
    };
  };

  public shared ({ caller }) func addComment(videoId : Text, content : Text) : async {
    id : Nat;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };
    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?_) {
        let existingCount = switch (comments.get(videoId)) {
          case (null) { 0 };
          case (?existing) { existing.size() };
        };
        let comment : Comment = {
          id = existingCount + 1;
          author = caller;
          content;
          timestamp = Time.now();
        };
        let updatedComments = switch (comments.get(videoId)) {
          case (null) { [comment] };
          case (?existing) { existing.concat([comment]) };
        };
        comments.add(videoId, updatedComments);
        updateVideoCommentCount(videoId);

        comment;
      };
    };
  };

  func updateVideoCommentCount(videoId : Text) {
    switch (videos.get(videoId)) {
      case (null) {};
      case (?video) {
        let commentCount = switch (comments.get(videoId)) {
          case (null) { 0 };
          case (?cmt) { cmt.size() };
        };
        let updatedVideo = { video with commentCount };
        videos.add(videoId, updatedVideo);
      };
    };
  };

  public query ({ caller }) func getComments(videoId : Text) : async [Comment] {
    // Anyone can view comments
    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?_) {
        switch (comments.get(videoId)) {
          case (null) { [] };
          case (?existing) { existing };
        };
      };
    };
  };

  func isValidChannelName(channelName : Text) : Bool {
    let cleaned = channelName.trim(#char ' ');
    if (cleaned.size() < 3 or cleaned.size() > 30) {
      return false;
    };
    for (char in cleaned.chars()) {
      switch (char) {
        case (ch) {
          if (not (('a' <= ch and ch <= 'z') or ('A' <= ch and ch <= 'Z') or ('0' <= ch and ch <= '9'))) {
            return false;
          };
        };
      };
    };
    true;
  };

  public shared ({ caller }) func setChannelName(channelName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set channel names");
    };
    if (not isValidChannelName(channelName)) {
      Runtime.trap("Invalid channel name. Must be 3-30 characters and contain only letters, numbers, and spaces");
    };
    channels.add(caller, channelName);
  };

  public query ({ caller }) func getChannelName(user : Principal) : async Text {
    // Anyone can view channel names
    switch (channels.get(user)) {
      case (null) { user.toText() };
      case (?channelName) { channelName };
    };
  };

  public query ({ caller }) func searchVideos(searchTerm : Text) : async [VideoMetadata] {
    // Anyone can search videos
    let lowercaseQuery = searchTerm.toLower();
    let filtered = videos.entries().filter(
      func((id, video)) {
        video.title.toLower().contains(#text (lowercaseQuery)) or video.description.toLower().contains(#text (lowercaseQuery));
      }
    );
    filtered.map(func((id, video)) { { video with id } }).toArray();
  };

  public shared ({ caller }) func deleteVideo(videoId : Text) : async () {
    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        // Only the owner or an admin can delete
        if (video.uploader != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the owner or an admin can delete this video");
        };
        videos.remove(videoId);
        // Clean up associated data
        comments.remove(videoId);
        videoLikes.remove(videoId);
      };
    };
  };

  public shared ({ caller }) func deletePhoto(photoId : Text) : async () {
    switch (photos.get(photoId)) {
      case (null) { Runtime.trap("Photo not found") };
      case (?photo) {
        // Only the owner or an admin can delete
        if (photo.uploader != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the owner or an admin can delete this photo");
        };
        photos.remove(photoId);
      };
    };
  };

  public shared ({ caller }) func updateVideo(videoId : Text, title : Text, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update videos");
    };
    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        // Only the owner or an admin can update
        if (video.uploader != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the owner or an admin can update this video");
        };
        let updatedVideo = { video with title; description };
        videos.add(videoId, updatedVideo);
      };
    };
  };

  public shared ({ caller }) func updatePhoto(photoId : Text, title : Text, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update photos");
    };
    switch (photos.get(photoId)) {
      case (null) { Runtime.trap("Photo not found") };
      case (?photo) {
        // Only the owner or an admin can update
        if (photo.uploader != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the owner or an admin can update this photo");
        };
        let updatedPhoto = { photo with title; description };
        photos.add(photoId, updatedPhoto);
      };
    };
  };

  public shared ({ caller }) func deleteComment(videoId : Text, commentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete comments");
    };
    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        switch (comments.get(videoId)) {
          case (null) { Runtime.trap("Comment not found") };
          case (?existing) {
            let commentOpt = existing.find(func(comment) { comment.id == commentId });
            switch (commentOpt) {
              case (null) { Runtime.trap("Comment not found") };
              case (?comment) {
                // Only the comment author or an admin can delete
                if (comment.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
                  Runtime.trap("Unauthorized: Only the comment author or an admin can delete this comment");
                };
                let filteredComments = existing.filter(func(comment) { comment.id != commentId });
                comments.add(videoId, filteredComments);
                updateVideoCommentCount(videoId);
              };
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func updateComment(videoId : Text, commentId : Nat, newContent : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update comments");
    };
    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        switch (comments.get(videoId)) {
          case (null) { Runtime.trap("Comment not found") };
          case (?existing) {
            let idx = existing.findIndex(func(comment) { comment.id == commentId });
            switch (idx) {
              case (null) { Runtime.trap("Comment not found") };
              case (?index) {
                // Only the comment author can update (not even admins should edit user comments)
                if (existing[index].author != caller) {
                  Runtime.trap("Unauthorized: Only the comment author can update this comment");
                };
                let updatedComments = existing.map(
                  func(comment) {
                    if (comment.id == commentId) {
                      { comment with content = newContent };
                    } else {
                      comment;
                    };
                  }
                );
                comments.add(videoId, updatedComments);
              };
            };
          };
        };
      };
    };
  };
};
