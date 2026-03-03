import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Float "mo:core/Float";
import Set "mo:core/Set";
import Stripe "stripe/stripe";

module {
  type Video = {
    title : Text;
    description : Text;
    uploader : Principal;
    uploadTime : Int;
    file : Blob;
    likeCount : Nat;
    commentCount : Nat;
    tags : [Text];
    thumbnail : ?Blob;
    viewCount : Nat;
  };

  type Photo = {
    title : Text;
    description : Text;
    uploader : Principal;
    uploadTime : Int;
    file : Blob;
  };

  type Comment = {
    id : Nat;
    author : Principal;
    content : Text;
    timestamp : Int;
  };

  type RatingData = {
    ratings : [Rating];
    averageRating : Float;
    totalRatings : Nat;
  };

  type Rating = {
    value : Nat;
    reviewer : Principal;
    timestamp : Int;
  };

  type SubscriptionStatus = {
    #free;
    #premium;
  };

  type Channel = {
    owner : Principal;
    channelName : Text;
  };

  type UserProfile = {
    name : Text;
    channelName : ?Text;
    accountCreation : Int;
  };

  type OldActor = {
    videos : Map.Map<Text, Video>;
    photos : Map.Map<Text, Photo>;
    comments : Map.Map<Text, [Comment]>;
    videoLikes : Map.Map<Text, Set.Set<Principal>>;
    channels : Map.Map<Principal, Text>;
    userProfiles : Map.Map<Principal, UserProfile>;
    ratings : Map.Map<Text, RatingData>;
    subscriptions : Map.Map<Principal, SubscriptionStatus>;
    stripeConfig : ?Stripe.StripeConfiguration;
  };

  type AdRevenue = {
    impressions : Nat;
    totalRevenue : Float;
  };

  type NewActor = {
    videos : Map.Map<Text, Video>;
    photos : Map.Map<Text, Photo>;
    comments : Map.Map<Text, [Comment]>;
    videoLikes : Map.Map<Text, Set.Set<Principal>>;
    channels : Map.Map<Principal, Text>;
    userProfiles : Map.Map<Principal, UserProfile>;
    ratings : Map.Map<Text, RatingData>;
    subscriptions : Map.Map<Principal, SubscriptionStatus>;
    stripeConfig : ?Stripe.StripeConfiguration;
    adRevenue : Map.Map<Text, AdRevenue>;
    creatorRevenue : Map.Map<Principal, Float>;
  };

  public func run(old : OldActor) : NewActor {
    { old with adRevenue = Map.empty<Text, AdRevenue>(); creatorRevenue = Map.empty<Principal, Float>() };
  };
};
