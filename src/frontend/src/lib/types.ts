import type { Principal } from "@dfinity/principal";
import type { Time } from "../backend";

// Local frontend types that mirror backend structures but are not exported from backend.d.ts

export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  uploader: Principal;
  uploadTime: Time;
  likeCount: bigint;
  commentCount: bigint;
  tags: string[];
  thumbnail?: string | null;
  viewCount: bigint;
}

export interface ExtendedVideo {
  id?: string;
  title: string;
  description: string;
  uploader: Principal;
  uploadTime: Time;
  likeCount: bigint;
  commentCount: bigint;
  tags: string[];
  thumbnail?: unknown;
  viewCount: bigint;
  // file is an ExternalBlob-like object
  file: {
    getDirectURL(): string;
  };
}

export interface Photo {
  title: string;
  description: string;
  uploader: Principal;
  uploadTime: Time;
  file: Uint8Array;
}

export interface PhotoMetadata {
  id: string;
  title: string;
  description: string;
  uploader: Principal;
  uploadTime: Time;
}

export interface Comment {
  id: bigint;
  author: Principal;
  content: string;
  timestamp: Time;
}

export interface UserStats {
  totalVideosUploaded: bigint;
  totalPhotosUploaded: bigint;
  accountCreation: Time;
}

export type SubscriptionStatus = { __kind__: "free" } | { __kind__: "premium" };
