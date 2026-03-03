import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import OutCall "http-outcalls/outcall";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import Stripe "stripe/stripe";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Initialize the access control system on canister instantiation
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  // Razorpay configuration type
  public type RazorpayConfig = {
    keyId : Text;
    keySecret : Text;
  };

  // AdSense configuration type
  public type AdSenseConfig = {
    publisherId : Text;
  };

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

  // New types for ratings
  public type Rating = {
    value : Nat; // 1-5 stars
    reviewer : Principal;
    timestamp : Time.Time;
  };

  public type RatingData = {
    ratings : [Rating];
    averageRating : Float;
    totalRatings : Nat;
  };

  public type AdRevenue = {
    impressions : Nat;
    totalRevenue : Float;
  };

  public type SubscriptionStatus = {
    #free;
    #premium;
  };

  let videos = Map.empty<Text, ExtendedVideo>();
  let photos = Map.empty<Text, Photo>();
  let comments = Map.empty<Text, [Comment]>();
  let videoLikes = Map.empty<Text, Set.Set<Principal>>();
  let channels = Map.empty<Principal, Text>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let ratings = Map.empty<Text, RatingData>();
  let subscriptions = Map.empty<Principal, SubscriptionStatus>();
  let adRevenue = Map.empty<Text, AdRevenue>();
  let creatorRevenue = Map.empty<Principal, Float>();

  // Stripe integration state
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // Razorpay and AdSense config state
  var razorpayConfig : ?RazorpayConfig = null;
  var adSenseConfig : ?AdSenseConfig = null;

  // ===================== Stripe Integration (Restored) ======================
  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set Stripe configuration");
    };
    stripeConfig := ?config;
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe configuration not found") };
      case (?config) { await Stripe.getSessionStatus(config, sessionId, transform) };
    };
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe configuration not found") };
      case (?config) { await Stripe.createCheckoutSession(config, caller, items, successUrl, cancelUrl, transform) };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // ===================== Razorpay Integration ======================
  public shared ({ caller }) func setRazorpayConfiguration(keyId : Text, keySecret : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set Razorpay configuration");
    };
    razorpayConfig := ?{ keyId; keySecret };
  };

  public query func isRazorpayConfiguredLegacy() : async Bool {
    razorpayConfig != null;
  };

  public query func getRazorpayConfig() : async ?RazorpayConfig {
    razorpayConfig;
  };

  // ===================== AdSense Integration ======================
  public shared ({ caller }) func setAdSensePublisherId(publisherId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set AdSense publisher ID");
    };
    adSenseConfig := ?{ publisherId };
  };

  public query func getAdSensePublisherId() : async ?Text {
    switch (adSenseConfig) {
      case (null) { null };
      case (?config) { ?config.publisherId };
    };
  };

  // User profile management functions remain unchanged...

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
};

