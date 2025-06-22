import axios from "axios";
// import { PaginatedResult } from "../models/common";
import { axiosRequests, axiosResponseBody } from "./common";
// import { APIResult, PaginatedResult } from "../models/common";
// import { QueriedAutocompleteOption, WikiPageSearchResult } from "../models/search";
import { PostRecord } from "typings";

export const postApiClient = {
    addPost: (values: PostRecord) =>
        axiosRequests.post(`/api/posts`, { values }).then(axiosResponseBody),     
    getPosts: (params: URLSearchParams | undefined) =>
        axios.get(`/api/posts`, { params }).then(axiosResponseBody),
    getBookmarkedPosts: (params: URLSearchParams | undefined, userId: string) =>
        axios.get(`/api/bookmarks/${userId}`, { params }).then(axiosResponseBody),
    getPost: (statusId: string) =>
        axios.get(`/api/posts/${statusId}`, {}).then(axiosResponseBody),
    getComments: (postId: string) =>
        axios.get(`/api/comments?postId=${postId}`, {}).then(axiosResponseBody),
}