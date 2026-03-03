import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  type OldActor = {
    videos : Map.Map<Text, {
      title : Text;
      description : Text;
      uploader : Principal;
      uploadTime : Time.Time;
      file : Blob;
      likeCount : Nat;
      commentCount : Nat;
      tags : [Text];
      thumbnail : ?Blob;
      viewCount : Nat;
    }>;
    // Other old state variables...
    cpm : Float;
  };

  type NewActor = {
    videos : Map.Map<Text, {
      title : Text;
      description : Text;
      uploader : Principal;
      uploadTime : Time.Time;
      file : Blob;
      likeCount : Nat;
      commentCount : Nat;
      tags : [Text];
      thumbnail : ?Blob;
      viewCount : Nat;
    }>;
    // Other new state variables...
    razorpayConfig : ?{ keyId : Text; keySecret : Text };
    adSenseConfig : ?{ publisherId : Text };
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      razorpayConfig = null;
      adSenseConfig = null;
    };
  };
};
