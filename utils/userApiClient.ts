import axios from "axios";
import { axiosResponseBody } from "./common";

export const userApiClient = {
    getUserProfile: (username: string) => 
        axios.get(`/api/users/${username}`).then(axiosResponseBody),
    getUserProfilePosts: (userId: string, params: URLSearchParams) =>
        axios.get(`/api/posts/users/${userId}`, { params }).then(axiosResponseBody),
}