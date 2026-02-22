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
export interface Video {
    title: string;
    likeCount: bigint;
    file: ExternalBlob;
    description: string;
    commentCount: bigint;
    uploader: Principal;
    uploadTime: Time;
}
export interface Photo {
    title: string;
    file: ExternalBlob;
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
export interface UserProfile {
    channelName?: string;
    name: string;
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
    uploadPhoto(title: string, description: string, file: ExternalBlob): Promise<string>;
    uploadVideo(title: string, description: string, file: ExternalBlob): Promise<string>;
}
