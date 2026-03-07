import Map "mo:core/Map";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import List "mo:core/List";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import OutCall "http-outcalls/outcall";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import Stripe "stripe/stripe";
import AccessControl "authorization/access-control";
import Runtime "mo:core/Runtime";

actor {
  // Initialize access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Include storage for handling files
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

  public type ExtendedVideo = {
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

  public type VideoMetadata = {
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

  public type PhotoMetadata = {
    id : Text;
    title : Text;
    description : Text;
    uploader : Principal;
    uploadTime : Time.Time;
  };

  public type Photo = {
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

  public type Channel = {
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
    value : Nat;
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

  // Stable collections hold all persistent data
  stable let videos = Map.empty<Text, ExtendedVideo>();
  stable let photos = Map.empty<Text, Photo>();
  stable let comments = Map.empty<Text, [Comment]>();
  stable let videoLikes = Map.empty<Text, Set.Set<Principal>>();
  stable let channels = Map.empty<Principal, Text>();
  stable let userProfiles = Map.empty<Principal, UserProfile>();
  stable let ratings = Map.empty<Text, RatingData>();
  stable let subscriptions = Map.empty<Principal, SubscriptionStatus>();
  stable let adRevenue = Map.empty<Text, AdRevenue>();
  stable let creatorRevenue = Map.empty<Principal, Float>();

  // Stripe integration state (no need for stable if only set by admin)
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // Razorpay and AdSense config state (mutable, non-stable)
  var razorpayConfig : ?RazorpayConfig = null;
  var adSenseConfig : ?AdSenseConfig = null;

  // Stripe Payment Integration
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe configuration not found") };
      case (?config) { await Stripe.createCheckoutSession(config, caller, items, successUrl, cancelUrl, transform) };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Razorpay Integration
  public shared ({ caller }) func setRazorpayConfiguration(keyId : Text, keySecret : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set Razorpay configuration");
    };
    razorpayConfig := ?{ keyId; keySecret };
  };

  public query ({ caller }) func isRazorpayConfiguredLegacy() : async Bool {
    razorpayConfig != null;
  };

  // Razorpay config contains sensitive keySecret — restrict to admins only
  public query ({ caller }) func getRazorpayConfig() : async ?RazorpayConfig {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view Razorpay configuration");
    };
    razorpayConfig;
  };

  // AdSense Integration
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

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    switch (userProfiles.get(caller)) {
      case (null) {
        let newProfile = {
          profile with accountCreation = Time.now();
        };
        userProfiles.add(caller, newProfile);
      };
      case (?existingProfile) {
        let updatedProfile = {
          profile with accountCreation = existingProfile.accountCreation;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };
};
