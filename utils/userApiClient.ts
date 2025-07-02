import axios from "axios";
import { axiosResponseBody } from "./common";
import { UserRegisterFormDto } from "typings";
import { FollowUserFormDto, UnFollowUserFormDto } from "models/users";

export const userApiClient = {
    getUserProfile: (username: string) => 
        axios.get(`api/userProfile/${username}`).then(axiosResponseBody),
    getUsersToAdd: (userId: string, params: URLSearchParams) =>
        axios.get(`api/users/${userId}/usersToAdd`, { params }).then(axiosResponseBody),
    getUserProfilePosts: (userId: string, params: URLSearchParams) =>
        axios.get(`api/posts/users/${userId}`, { params }).then(axiosResponseBody),
    completeRegistration: (userId: string, values: UserRegisterFormDto) =>
        axios.post(`api/users/${userId}/completeRegistration`, { values }).then(axiosResponseBody),
    followUser: (userId: string, values: FollowUserFormDto) =>
        axios.patch(`api/users/${userId}/follow`, { values }).then(axiosResponseBody),
    unFollowUser: (userId: string, values: UnFollowUserFormDto) =>
        axios.patch(`api/users/${userId}/unfollow`, { values }).then(axiosResponseBody),

}