import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Set "mo:core/Set";
import Storage "blob-storage/Storage";

module {
  type ExtendedVideo = {
    title : Text;
    description : Text;
    uploader : Principal.Principal;
    uploadTime : Time.Time;
    file : Storage.ExternalBlob;
    likeCount : Nat;
    commentCount : Nat;
    tags : [Text];
    thumbnail : ?Storage.ExternalBlob;
    viewCount : Nat;
  };

  type Photo = {
    title : Text;
    description : Text;
    uploader : Principal.Principal;
    uploadTime : Time.Time;
    file : Blob;
  };

  type Comment = {
    id : Nat;
    author : Principal.Principal;
    content : Text;
    timestamp : Time.Time;
  };

  type UserProfile = {
    name : Text;
    channelName : ?Text;
    accountCreation : Time.Time;
  };

  type Rating = {
    value : Nat;
    reviewer : Principal.Principal;
    timestamp : Time.Time;
  };

  type RatingData = {
    ratings : [Rating];
    averageRating : Float;
    totalRatings : Nat;
  };

  // Old actor state (without ratings map)
  type OldActor = {
    videos : Map.Map<Text, ExtendedVideo>;
    photos : Map.Map<Text, Photo>;
    comments : Map.Map<Text, [Comment]>;
    videoLikes : Map.Map<Text, Set.Set<Principal.Principal>>;
    channels : Map.Map<Principal.Principal, Text>;
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
  };

  // New actor state with ratings map
  type NewActor = {
    videos : Map.Map<Text, ExtendedVideo>;
    photos : Map.Map<Text, Photo>;
    comments : Map.Map<Text, [Comment]>;
    videoLikes : Map.Map<Text, Set.Set<Principal.Principal>>;
    channels : Map.Map<Principal.Principal, Text>;
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
    ratings : Map.Map<Text, RatingData>;
  };

  public func run(old : OldActor) : NewActor {
    let newRatings = Map.empty<Text, RatingData>();
    { old with ratings = newRatings };
  };
};
