import Time "mo:core/Time";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Set "mo:core/Set";
import List "mo:core/List";


import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Apply migration on upgrades

actor {
  // Initialize the access control system on canister instantiation
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  type ExtendedVideo = {
    title : Text;
    description : Text;
    uploader : Principal;
    uploadTime : Time.Time;
    file : Storage.ExternalBlob;
    likeCount : Nat;
    commentCount : Nat;
    tags : [Text];
    thumbnail : ?Storage.ExternalBlob;
    viewCount : Nat;
  };

  type VideoMetadata = {
    id : Text;
    title : Text;
    description : Text;
    uploader : Principal;
    uploadTime : Time.Time;
    likeCount : Nat;
    commentCount : Nat;
    tags : [Text];
    thumbnail : ?Storage.ExternalBlob;
    viewCount : Nat;
  };

  type PhotoMetadata = {
    id : Text;
    title : Text;
    description : Text;
    uploader : Principal;
    uploadTime : Time.Time;
  };

  type Photo = {
    title : Text;
    description : Text;
    uploader : Principal;
    uploadTime : Time.Time;
    file : Blob;
  };

  public type Comment = {
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
    accountCreation : Time.Time;
  };

  public type UserStats = {
    totalVideosUploaded : Nat;
    totalPhotosUploaded : Nat;
    accountCreation : Time.Time;
  };

  let videos = Map.empty<Text, ExtendedVideo>();
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
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let existingProfile = userProfiles.get(caller);
    let accountCreation = switch (existingProfile) {
      case (null) { Time.now() };
      case (?existing) { existing.accountCreation };
    };

    let newProfile = { profile with accountCreation };
    userProfiles.add(caller, newProfile);
  };

  public shared ({ caller }) func uploadVideo(title : Text, description : Text, tags : [Text], file : Storage.ExternalBlob) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload videos");
    };
    let videoId = "video_" # Time.now().toText();
    let video : ExtendedVideo = {
      title;
      description;
      tags;
      uploader = caller;
      uploadTime = Time.now();
      file;
      likeCount = 0;
      commentCount = 0;
      thumbnail = null;
      viewCount = 0;
    };
    videos.add(videoId, video);
    videoId;
  };

  public shared ({ caller }) func uploadPhoto(title : Text, description : Text, file : Blob) : async Text {
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

  // incrementVideoViewCount: No authentication required - anyone (including guests) can increment view counts
  public shared ({ caller }) func incrementVideoViewCount(videoId : Text) : async () {
    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Failed to increment view count: video not found") };
      case (?video) {
        let updatedVideo = { video with viewCount = video.viewCount + 1 };
        videos.add(videoId, updatedVideo);
      };
    };
  };

  public query ({ caller }) func getVideo(videoId : Text) : async ExtendedVideo {
    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) { video };
    };
  };

  public query ({ caller }) func getVideoMetadata(videoId : Text) : async VideoMetadata {
    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        {
          id = videoId;
          title = video.title;
          description = video.description;
          uploader = video.uploader;
          uploadTime = video.uploadTime;
          likeCount = video.likeCount;
          commentCount = video.commentCount;
          tags = video.tags;
          thumbnail = video.thumbnail;
          viewCount = video.viewCount;
        };
      };
    };
  };

  public query ({ caller }) func getPhoto(photoId : Text) : async Photo {
    switch (photos.get(photoId)) {
      case (null) { Runtime.trap("Photo not found") };
      case (?photo) { photo };
    };
  };

  public query ({ caller }) func listVideos() : async [VideoMetadata] {
    videos.entries().map(func((id, video)) { { video with id } }).toArray();
  };

  public query ({ caller }) func listPhotos() : async [PhotoMetadata] {
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
    switch (channels.get(user)) {
      case (null) { user.toText() };
      case (?channelName) { channelName };
    };
  };

  public query ({ caller }) func searchVideos(searchTerm : Text) : async [VideoMetadata] {
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
        if (video.uploader != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the owner or an admin can delete this video");
        };
        videos.remove(videoId);
        comments.remove(videoId);
        videoLikes.remove(videoId);
      };
    };
  };

  public shared ({ caller }) func deletePhoto(photoId : Text) : async () {
    switch (photos.get(photoId)) {
      case (null) { Runtime.trap("Photo not found") };
      case (?photo) {
        if (photo.uploader != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the owner or an admin can delete this photo");
        };
        photos.remove(photoId);
      };
    };
  };

  public shared ({ caller }) func updateVideo(videoId : Text, title : Text, description : Text, tags : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update videos");
    };
    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        if (video.uploader != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the owner or an admin can update this video");
        };
        let updatedVideo = { video with title; description; tags };
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

  public query ({ caller }) func getUserStats(user : Principal) : async UserStats {
    let profile = switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?p) { p };
    };

    let totalVideos = videos.values().filter(func(v) { v.uploader == user }).size();
    let totalPhotos = photos.values().filter(func(p) { p.uploader == user }).size();

    {
      totalVideosUploaded = totalVideos;
      totalPhotosUploaded = totalPhotos;
      accountCreation = profile.accountCreation;
    };
  };

  // Store custom thumbnail for a video
  public shared ({ caller }) func setCustomThumbnail(videoId : Text, thumbnailBlob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set thumbnails");
    };

    let video = switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?v) { v };
    };

    if (caller != video.uploader and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the owner or an admin can set thumbnail");
    };

    let updatedVideo = { video with thumbnail = ?thumbnailBlob };
    videos.add(videoId, updatedVideo);
  };

  // Mark thumbnail as auto-generated after successful frontend generation
  public shared ({ caller }) func markThumbnailGenerated(videoId : Text, thumbnailBlob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark thumbnails as generated");
    };

    let video = switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?v) { v };
    };

    if (caller != video.uploader and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the owner or an admin can mark thumbnail as generated.");
    };

    let updatedVideo = { video with thumbnail = ?thumbnailBlob };
    videos.add(videoId, updatedVideo);
  };

  // Remove a custom thumbnail
  public shared ({ caller }) func removeThumbnail(videoId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove thumbnails");
    };

    let video = switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?v) { v };
    };

    if (caller != video.uploader and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the owner or an admin can remove thumbnail");
    };

    let updatedVideo = { video with thumbnail = null };
    videos.add(videoId, updatedVideo);
  };
};

