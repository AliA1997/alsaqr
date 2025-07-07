export interface LikedPostParams {
    statusId: string;
    userId: string;
    liked: boolean;
}
export interface LikedCommentParams extends LikedPostParams {};

export interface RePostParams {
    statusId: string;
    userId: string;
    reposted: boolean;
}
export interface RePostCommentParams extends RePostParams {};


export interface BookmarkParams {
    statusId: string;
    userId: string;
    bookmarked: boolean;
}