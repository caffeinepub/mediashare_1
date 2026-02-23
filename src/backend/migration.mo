import Map "mo:core/Map";
import Text "mo:core/Text";
import Set "mo:core/Set";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Blob "mo:core/Blob";

module {
  type OldVideo = {
    title : Text;
    description : Text;
    uploader : Principal;
    uploadTime : Time.Time;
    file : Blob;
    likeCount : Nat;
    commentCount : Nat;
  };

  type OldPhoto = {
    title : Text;
    description : Text;
    uploader : Principal;
    uploadTime : Time.Time;
    file : Blob;
  };

  type OldComment = {
    id : Nat;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  type OldUserProfile = {
    name : Text;
    channelName : ?Text;
    accountCreation : Time.Time;
  };

  type OldActor = {
    videos : Map.Map<Text, OldVideo>;
    photos : Map.Map<Text, OldPhoto>;
    comments : Map.Map<Text, [OldComment]>;
    videoLikes : Map.Map<Text, Set.Set<Principal>>;
    channels : Map.Map<Principal, Text>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  type NewVideo = {
    title : Text;
    description : Text;
    uploader : Principal;
    uploadTime : Time.Time;
    file : Blob;
    likeCount : Nat;
    commentCount : Nat;
  };

  type NewPhoto = {
    title : Text;
    description : Text;
    uploader : Principal;
    uploadTime : Time.Time;
    file : Blob;
  };

  type NewComment = {
    id : Nat;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  type NewUserProfile = {
    name : Text;
    channelName : ?Text;
    accountCreation : Time.Time;
  };

  type NewActor = {
    videos : Map.Map<Text, NewVideo>;
    photos : Map.Map<Text, NewPhoto>;
    comments : Map.Map<Text, [NewComment]>;
    videoLikes : Map.Map<Text, Set.Set<Principal>>;
    channels : Map.Map<Principal, Text>;
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  // Transform old video to new video format
  func convertVideo(oldVideo : OldVideo) : NewVideo {
    oldVideo;
  };

  // Transform old photo to new photo format
  func convertPhoto(oldPhoto : OldPhoto) : NewPhoto {
    oldPhoto;
  };

  // Perform full state migration
  public func run(old : OldActor) : NewActor {
    let newVideos = old.videos.map<Text, OldVideo, NewVideo>(
      func(_id, oldVideo) { convertVideo(oldVideo) }
    );

    let newPhotos = old.photos.map<Text, OldPhoto, NewPhoto>(
      func(_id, oldPhoto) { convertPhoto(oldPhoto) }
    );

    let newComments = old.comments.map<Text, [OldComment], [NewComment]>(
      func(_id, oldComments) { oldComments }
    );

    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_id, oldProfile) { oldProfile }
    );

    {
      videos = newVideos;
      photos = newPhotos;
      comments = newComments;
      videoLikes = old.videoLikes;
      channels = old.channels;
      userProfiles = newUserProfiles;
    };
  };
};
