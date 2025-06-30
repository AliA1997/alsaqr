import axios from "axios";
import { axiosRequests, axiosResponseBody } from "./common";
import { CreateListOrCommunityFormDto } from "typings";

export const communityApiClient = {
    addCommunity: (values: CreateListOrCommunityFormDto, userId: string) =>
        axiosRequests.post(`/api/communities/${userId}`, { values }).then(axiosResponseBody),     
    getCommunities: (params: URLSearchParams | undefined, userId: string) =>
        axios.get(`/api/communities/${userId}`, { params }).then(axiosResponseBody),
    getCommunity: (params: URLSearchParams | undefined, userId: string,  communityId: string) =>
        axios.get(`/api/communities/${userId}/${communityId}`, { params }).then(axiosResponseBody)
}