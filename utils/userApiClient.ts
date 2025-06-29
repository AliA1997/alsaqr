import axios from "axios";
import { axiosResponseBody } from "./common";
import { UserRegisterFormDto } from "typings";

export const userApiClient = {
    getUserProfile: (username: string) => 
        axios.get(`/api/users/${username}`).then(axiosResponseBody),
    getUsersToAdd: (userId: string, params: URLSearchParams) =>
        axios.get(`/api/users/${userId}/usersToAdd`, { params }).then(axiosResponseBody),
    getUserProfilePosts: (userId: string, params: URLSearchParams) =>
        axios.get(`/api/posts/users/${userId}`, { params }).then(axiosResponseBody),
    completeRegistration: (userId: string, values: UserRegisterFormDto) =>
        axios.post(`/api/users/${userId}/completeRegistration`, { values }).then(axiosResponseBody),
}