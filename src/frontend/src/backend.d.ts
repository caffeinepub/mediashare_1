import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface UserStats {
    totalVideosUploaded: bigint;
    accountCreation: Time;
    totalPhotosUploaded: bigint;
}
export interface UserProfile {
    channelName?: string;
    name: string;
    accountCreation: Time;
}
export type Time = bigint;
export interface Rating {
    value: bigint;
    timestamp: Time;
    reviewer: Principal;
}
export interface Comment {
    id: bigint;
    content: string;
    author: Principal;
    timestamp: Time;
}
export interface PhotoMetadata {
    id: string;
    title: string;
    description: string;
    uploader: Principal;
    uploadTime: Time;
}
export interface VideoMetadata {
    id: string;
    title: string;
    likeCount: bigint;
    thumbnail?: ExternalBlob;
    tags: Array<string>;
    description: string;
    viewCount: bigint;
    commentCount: bigint;
    uploader: Principal;
    uploadTime: Time;
}
export interface ExtendedVideo {
    title: string;
    likeCount: bigint;
    thumbnail?: ExternalBlob;
    file: ExternalBlob;
    tags: Array<string>;
    description: string;
    viewCount: bigint;
    commentCount: bigint;
    uploader: Principal;
    uploadTime: Time;
}
export interface Photo {
    title: string;
    file: Uint8Array;
    description: string;
    uploader: Principal;
    uploadTime: Time;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(videoId: string, content: string): Promise<{
        id: bigint;
        content: string;
        author: Principal;
        timestamp: Time;
    }>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteComment(videoId: string, commentId: bigint): Promise<void>;
    deletePhoto(photoId: string): Promise<void>;
    deleteVideo(videoId: string): Promise<void>;
    getAllVideoRatings(videoId: string): Promise<Array<Rating>>;
    getAverageRating(videoId: string): Promise<number>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChannelName(user: Principal): Promise<string>;
    getComments(videoId: string): Promise<Array<Comment>>;
    getPhoto(photoId: string): Promise<Photo>;
    getRatingAnalytics(videoId: string): Promise<{
        totalRatings: bigint;
        ratingBreakdown: Array<bigint>;
        averageRating: number;
    }>;
    getTotalRatings(videoId: string): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserRatings(): Promise<Array<[string, Rating]>>;
    getUserStats(user: Principal): Promise<UserStats>;
    getVideo(videoId: string): Promise<ExtendedVideo>;
    getVideoMetadata(videoId: string): Promise<VideoMetadata>;
    incrementViewCount(videoId: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    likeVideo(videoId: string): Promise<void>;
    listPhotos(): Promise<Array<PhotoMetadata>>;
    listVideos(): Promise<Array<VideoMetadata>>;
    markThumbnailGenerated(videoId: string, thumbnailBlob: ExternalBlob): Promise<void>;
    rateVideo(videoId: string, stars: bigint): Promise<void>;
    removeThumbnail(videoId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchVideos(searchTerm: string): Promise<Array<VideoMetadata>>;
    setChannelName(channelName: string): Promise<void>;
    setCustomThumbnail(videoId: string, thumbnailBlob: ExternalBlob): Promise<void>;
    updateComment(videoId: string, commentId: bigint, newContent: string): Promise<void>;
    updatePhoto(photoId: string, title: string, description: string): Promise<void>;
    updateVideo(videoId: string, title: string, description: string, tags: Array<string>): Promise<void>;
    uploadPhoto(title: string, description: string, file: Uint8Array): Promise<string>;
    uploadVideo(title: string, description: string, tags: Array<string>, file: ExternalBlob): Promise<string>;
}
