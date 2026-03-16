import Map "mo:core/Map";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import List "mo:core/List";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
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
    file : Storage.ExternalBlob;
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

  var videos = Map.empty<Text, ExtendedVideo>();
  var photos = Map.empty<Text, Photo>();
  var comments = Map.empty<Text, [Comment]>();
  var videoLikes = Map.empty<Text, Set.Set<Principal>>();
  var channels = Map.empty<Principal, Text>();
  var userProfiles = Map.empty<Principal, UserProfile>();
  var ratings = Map.empty<Text, RatingData>();
  var subscriptions = Map.empty<Principal, SubscriptionStatus>();
  var adRevenue = Map.empty<Text, AdRevenue>();
  var creatorRevenue = Map.empty<Principal, Float>();

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

  // Video Management
  public shared ({ caller }) func uploadVideo(title : Text, description : Text, tags : [Text], file : Storage.ExternalBlob) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload videos");
    };

    let currentTime = Time.now();
    let videoId = currentTime.toText() # "-" # caller.toText();

    let newVideo : ExtendedVideo = {
      title;
      description;
      uploader = caller;
      uploadTime = currentTime;
      file;
      likeCount = 0;
      commentCount = 0;
      tags;
      thumbnail = null;
      viewCount = 0;
    };

    videos.add(videoId, newVideo);
    videoLikes.add(videoId, Set.empty<Principal>());

    videoId;
  };

  public query func listVideos() : async [VideoMetadata] {
    let allVideos = videos.toArray();

    let sortedVideos = allVideos.sort(
      func((_, a), (_, b)) {
        Text.compare(b.uploadTime.toNat().toText(), a.uploadTime.toNat().toText());
      }
    );

    sortedVideos.map(
      func((videoId, video)) {
        {
          video with id = videoId;
        };
      }
    );
  };

  public query func getVideo(id : Text) : async ?ExtendedVideo {
    videos.get(id);
  };

  public shared ({ caller }) func deleteVideo(id : Text) : async () {
    let videoOpt = videos.get(id);
    switch (videoOpt) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        if (video.uploader != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the video owner or admins can delete videos");
        };
        videos.remove(id);
        videoLikes.remove(id);
      };
    };
  };

  public shared ({ caller }) func likeVideo(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can like videos");
    };

    let videoOpt = videos.get(id);
    switch (videoOpt) {
      case (null) { Runtime.trap("Video not found") };
      case (?_) {
        let userSetOpt = videoLikes.get(id);
        switch (userSetOpt) {
          case (null) {
            let newSet = Set.empty<Principal>();
            newSet.add(caller);
            videoLikes.add(id, newSet);
          };
          case (?userSet) {
            if (userSet.contains(caller)) {
              userSet.remove(caller);
            } else {
              userSet.add(caller);
            };
          };
        };
      };
    };
  };

  public func incrementVideoView(id : Text) : async () {
    let videoOpt = videos.get(id);
    switch (videoOpt) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        let updatedVideo = {
          video with viewCount = video.viewCount + 1;
        };
        videos.add(id, updatedVideo);
      };
    };
  };

  public shared ({ caller }) func updateVideo(videoId : Text, title : Text, description : Text, tags : [Text]) : async () {
    let videoOpt = videos.get(videoId);
    switch (videoOpt) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        if (video.uploader != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the video owner or admins can update videos");
        };
        let updatedVideo = {
          video with title;
          description;
          tags;
        };
        videos.add(videoId, updatedVideo);
      };
    };
  };

  public shared ({ caller }) func setCustomThumbnail(videoId : Text, thumbnail : Storage.ExternalBlob) : async () {
    let videoOpt = videos.get(videoId);
    switch (videoOpt) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        if (video.uploader != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the video owner or admins can set thumbnails");
        };
        let updatedVideo = {
          video with thumbnail = ?thumbnail;
        };
        videos.add(videoId, updatedVideo);
      };
    };
  };

  public shared ({ caller }) func markThumbnailGenerated(videoId : Text, thumbnailBlob : Storage.ExternalBlob) : async () {
    let videoOpt = videos.get(videoId);
    switch (videoOpt) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        if (video.uploader != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the video owner or admins can mark thumbnails as generated");
        };
        let updatedVideo = {
          video with thumbnail = ?thumbnailBlob;
        };
        videos.add(videoId, updatedVideo);
      };
    };
  };

  public shared ({ caller }) func removeVideoThumbnail(videoId : Text) : async () {
    let videoOpt = videos.get(videoId);
    switch (videoOpt) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        if (video.uploader != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the video owner or admins can remove thumbnails");
        };
        let updatedVideo = {
          video with thumbnail = null;
        };
        videos.add(videoId, updatedVideo);
      };
    };
  };

  // Comments
  public shared ({ caller }) func addComment(videoId : Text, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };

    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?_) {
        let newComment : Comment = {
          id = Int.abs(Time.now());
          author = caller;
          content;
          timestamp = Time.now();
        };

        let currentComments = switch (comments.get(videoId)) {
          case (null) { [] };
          case (?existingComments) { existingComments };
        };

        comments.add(videoId, [newComment].concat(currentComments));

        // Update comment count in the video
        switch (videos.get(videoId)) {
          case (null) { () };
          case (?video) {
            let updatedVideo = {
              video with commentCount = currentComments.size() + 1;
            };
            videos.add(videoId, updatedVideo);
          };
        };
      };
    };
  };

  public query func getComments(videoId : Text) : async [Comment] {
    switch (comments.get(videoId)) {
      case (null) { [] };
      case (?existingComments) { existingComments };
    };
  };

  // Channels
  public shared ({ caller }) func setChannelName(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set channel names");
    };
    channels.add(caller, name);
  };

  public query func getChannelName(principal : Principal) : async ?Text {
    channels.get(principal);
  };

  // Ratings
  public shared ({ caller }) func rateVideo(videoId : Text, stars : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can rate videos");
    };
    if (stars < 1 or stars > 5) {
      Runtime.trap("Rating must be between 1 and 5 stars");
    };

    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?_) {
        let rating = {
          value = stars;
          reviewer = caller;
          timestamp = Time.now();
        };

        let currentRatings = switch (ratings.get(videoId)) {
          case (null) { [] };
          case (?existingRatingsData) { existingRatingsData.ratings };
        };

        // Remove previous rating from the same user if exists
        let filteredRatings = switch (currentRatings.find(func(r) { r.reviewer == caller })) {
          case (null) { currentRatings };
          case (?_) {
            currentRatings.filter(func(r) { r.reviewer != caller });
          };
        };

        let allRatings = [rating].concat(filteredRatings);
        let totalRatings = allRatings.size();

        let totalSum = allRatings.foldLeft(
          0.0,
          func(acc, next) {
            acc + next.value.toFloat();
          },
        );
        let averageRating = if (totalRatings > 0) { totalSum / totalRatings.toFloat() } else {
          0.0;
        };

        let newRatingData : RatingData = {
          ratings = allRatings;
          averageRating;
          totalRatings;
        };

        ratings.add(videoId, newRatingData);
      };
    };
  };

  public query func getAverageRating(videoId : Text) : async Float {
    switch (ratings.get(videoId)) {
      case (null) { 0.0 };
      case (?ratingData) { ratingData.averageRating };
    };
  };

  public query func getTotalRatings(videoId : Text) : async Nat {
    switch (ratings.get(videoId)) {
      case (null) { 0 };
      case (?ratingData) { ratingData.totalRatings };
    };
  };

  public query ({ caller }) func getUserRatings() : async [{ videoId : Text; rating : Nat }] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their ratings");
    };

    let userRatings = List.empty<{ videoId : Text; rating : Nat }>();

    let iter = ratings.entries();
    iter.forEach(
      func((videoId, ratingData)) {
        let userRatingsList = ratingData.ratings.filter(func(r) { r.reviewer == caller });

        userRatingsList.forEach(
          func(rating) {
            userRatings.add({ videoId; rating = rating.value });
          }
        );
      }
    );

    userRatings.toArray();
  };

  // Ad revenue
  public func recordAdImpression(videoId : Text) : async () {
    let currentRevenue = switch (adRevenue.get(videoId)) {
      case (null) { { impressions = 0; totalRevenue = 0.0 } };
      case (?existingRevenue) { existingRevenue };
    };

    let updatedRevenue = {
      currentRevenue with
      impressions = currentRevenue.impressions + 1;
      totalRevenue = currentRevenue.totalRevenue + 0.001;
    };

    adRevenue.add(videoId, updatedRevenue);

    switch (videos.get(videoId)) {
      case (null) { () };
      case (?video) {
        let currentCreatorRevenue = switch (creatorRevenue.get(video.uploader)) {
          case (null) { 0.0 };
          case (?existing) { existing };
        };

        creatorRevenue.add(
          video.uploader,
          currentCreatorRevenue + 0.001,
        );
      };
    };
  };

  public query func getAdRevenueForVideo(videoId : Text) : async AdRevenue {
    switch (adRevenue.get(videoId)) {
      case (null) { { impressions = 0; totalRevenue = 0.0 } };
      case (?revenue) { revenue };
    };
  };

  public query ({ caller }) func getAdRevenueForCaller() : async Float {
    switch (creatorRevenue.get(caller)) {
      case (null) { 0.0 };
      case (?revenue) { revenue };
    };
  };

  // User Stats
  public query func getUserStats(principal : Principal) : async ?UserStats {
    let totalVideos = videos.values().toArray().filter(func(v) { v.uploader == principal }).size();
    let totalPhotos = photos.values().toArray().filter(func(p) { p.uploader == principal }).size();

    // Fetch account creation from user profile if exists, otherwise use current time
    let accountCreation = switch (userProfiles.get(principal)) {
      case (null) { Time.now() };
      case (?profile) { profile.accountCreation };
    };

    ?{
      totalVideosUploaded = totalVideos;
      totalPhotosUploaded = totalPhotos;
      accountCreation;
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
