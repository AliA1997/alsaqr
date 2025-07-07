import axios from "axios";
// import { PaginatedResult } from "../models/common";
import { axiosRequests, axiosResponseBody } from "./common";
// import { APIResult, PaginatedResult } from "../models/common";
// import { QueriedAutocompleteOption, WikiPageSearchResult } from "../models/search";
import { CommentForm, PostRecord } from "typings";
import { LikedCommentParams, RePostCommentParams } from "models/posts";

export const commentApiClient = {
    addComment: (values: CommentForm) =>
        axiosRequests.post(`/api/comments`, { values }).then(axiosResponseBody),
    getCommentsForPost: (params: URLSearchParams | undefined, postId: string) =>
        axios.get(`/api/posts/${postId}/comments`, { params }).then(axiosResponseBody),
    getCommentsById: (commentId: string) =>
        axios.get(`/api/comments/${commentId}`).then(axiosResponseBody),
    likedComment: (commentId: string, values: LikedCommentParams) =>
        axiosRequests.patch(`/api/comments/${commentId}/liked`, { values }).then(axiosResponseBody),
    rePostComment: (commentId: string, values: RePostCommentParams) =>
        axiosRequests.patch(`/api/comments/${commentId}/repost`, { values }).then(axiosResponseBody),
    deleteComment: (commentId: string) =>
        axiosRequests.del(`/api/comments/${commentId}`).then(axiosResponseBody),
};