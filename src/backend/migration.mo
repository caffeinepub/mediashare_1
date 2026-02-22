import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";

module {
  type OldVideo = {
    title : Text;
    description : Text;
    uploader : Principal;
    uploadTime : Time.Time;
    file : Storage.ExternalBlob;
  };

  type OldPhoto = {
    title : Text;
    description : Text;
    uploader : Principal;
    uploadTime : Time.Time;
    file : Storage.ExternalBlob;
  };

  type OldActor = {
    videos : Map.Map<Text, OldVideo>;
    photos : Map.Map<Text, OldPhoto>;
  };

  type NewVideo = {
    title : Text;
    description : Text;
    uploader : Principal;
    uploadTime : Time.Time;
    file : Storage.ExternalBlob;
    likeCount : Nat;
    commentCount : Nat;
  };

  type NewPhoto = {
    title : Text;
    description : Text;
    uploader : Principal;
    uploadTime : Time.Time;
    file : Storage.ExternalBlob;
  };

  type NewComment = {
    id : Nat;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  type UserProfile = {
    name : Text;
    channelName : ?Text;
  };

  type NewActor = {
    videos : Map.Map<Text, NewVideo>;
    photos : Map.Map<Text, NewPhoto>;
    comments : Map.Map<Text, [NewComment]>;
    videoLikes : Map.Map<Text, Set.Set<Principal>>;
    channels : Map.Map<Principal, Text>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let newVideos = old.videos.map<Text, OldVideo, NewVideo>(
      func(_id, oldVideo) {
        { oldVideo with likeCount = 0; commentCount = 0 };
      }
    );
    {
      videos = newVideos;
      photos = old.photos;
      comments = Map.empty<Text, [NewComment]>();
      videoLikes = Map.empty<Text, Set.Set<Principal>>();
      channels = Map.empty<Principal, Text>();
      userProfiles = Map.empty<Principal, UserProfile>();
    };
  };
};
