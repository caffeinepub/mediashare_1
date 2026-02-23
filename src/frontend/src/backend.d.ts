import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Video {
    title: string;
    likeCount: bigint;
    file: Uint8Array;
    description: string;
    commentCount: bigint;
    uploader: Principal;
    uploadTime: Time;
}
export interface UserProfile {
    channelName?: string;
    name: string;
    accountCreation: Time;
}
export interface Photo {
    title: string;
    file: Uint8Array;
    description: string;
    uploader: Principal;
    uploadTime: Time;
}
export type Time = bigint;
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
    description: string;
    commentCount: bigint;
    uploader: Principal;
    uploadTime: Time;
}
export interface UserStats {
    totalVideosUploaded: bigint;
    accountCreation: Time;
    totalPhotosUploaded: bigint;
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
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChannelName(user: Principal): Promise<string>;
    getComments(videoId: string): Promise<Array<Comment>>;
    getPhoto(photoId: string): Promise<Photo>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserStats(user: Principal): Promise<UserStats>;
    getVideo(videoId: string): Promise<Video>;
    isCallerAdmin(): Promise<boolean>;
    likeVideo(videoId: string): Promise<void>;
    listPhotos(): Promise<Array<PhotoMetadata>>;
    listVideos(): Promise<Array<VideoMetadata>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchVideos(searchTerm: string): Promise<Array<VideoMetadata>>;
    setChannelName(channelName: string): Promise<void>;
    updateComment(videoId: string, commentId: bigint, newContent: string): Promise<void>;
    updatePhoto(photoId: string, title: string, description: string): Promise<void>;
    updateVideo(videoId: string, title: string, description: string): Promise<void>;
    uploadPhoto(title: string, description: string, file: Uint8Array): Promise<string>;
    uploadVideo(title: string, description: string, file: Uint8Array): Promise<string>;
}
