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
export interface RazorpayConfig {
    keyId: string;
    keySecret: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface Comment {
    id: bigint;
    content: string;
    author: Principal;
    timestamp: Time;
}
export interface AdRevenue {
    impressions: bigint;
    totalRevenue: number;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
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
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
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
export interface UserProfile {
    channelName?: string;
    name: string;
    accountCreation: Time;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(videoId: string, content: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteVideo(id: string): Promise<void>;
    getAdRevenueForCaller(): Promise<number>;
    getAdRevenueForVideo(videoId: string): Promise<AdRevenue>;
    getAdSensePublisherId(): Promise<string | null>;
    getAverageRating(videoId: string): Promise<number>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChannelName(principal: Principal): Promise<string | null>;
    getComments(videoId: string): Promise<Array<Comment>>;
    getRazorpayConfig(): Promise<RazorpayConfig | null>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTotalRatings(videoId: string): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserRatings(): Promise<Array<{
        rating: bigint;
        videoId: string;
    }>>;
    getUserStats(principal: Principal): Promise<UserStats | null>;
    getVideo(id: string): Promise<ExtendedVideo | null>;
    incrementVideoView(id: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isRazorpayConfiguredLegacy(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    likeVideo(id: string): Promise<void>;
    listVideos(): Promise<Array<VideoMetadata>>;
    markThumbnailGenerated(videoId: string, thumbnailBlob: ExternalBlob): Promise<void>;
    rateVideo(videoId: string, stars: bigint): Promise<void>;
    recordAdImpression(videoId: string): Promise<void>;
    removeVideoThumbnail(videoId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAdSensePublisherId(publisherId: string): Promise<void>;
    setChannelName(name: string): Promise<void>;
    setCustomThumbnail(videoId: string, thumbnail: ExternalBlob): Promise<void>;
    setRazorpayConfiguration(keyId: string, keySecret: string): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateVideo(videoId: string, title: string, description: string, tags: Array<string>): Promise<void>;
    uploadVideo(title: string, description: string, tags: Array<string>, file: ExternalBlob): Promise<string>;
}
