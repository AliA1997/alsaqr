export interface LikedPostParams {
    statusId: string;
    userId: string;
    liked: boolean;
}

export interface RePostParams {
    statusId: string;
    userId: string;
    reposted: boolean;
}

export interface BookmarkParams {
    statusId: string;
    userId: string;
    bookmarked: boolean;
}