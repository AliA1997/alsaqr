import axios from "axios";
import { axiosRequests, axiosResponseBody } from "./common";
import { CreateListOrCommunityFormDto } from "typings";
import { CommunityDiscussionMessageDto, UpdateCommunityFormDto } from "models/community";

export const communityApiClient = {
    updateCommunity: (values: UpdateCommunityFormDto, userId: string, communityId: string) =>
        axiosRequests.put(`/api/communities/${userId}/${communityId}`, { values }).then(axiosResponseBody),
    getAdminCommunityInfo: (params: URLSearchParams | undefined, userId: string, communityId: string) =>
        axios.get(`/api/communities/${userId}/${communityId}`, { params }).then(axiosResponseBody),
    addCommunity: (values: CreateListOrCommunityFormDto, userId: string) =>
        axiosRequests.post(`/api/communities/${userId}`, { values }).then(axiosResponseBody),
    getCommunities: (params: URLSearchParams | undefined, userId: string) =>
        axios.get(`/api/communities/${userId}`, { params }).then(axiosResponseBody),
    
    addCommunityDiscussion: (values: CreateListOrCommunityFormDto, userId: string, communityId: string) =>
        axios.post(`/api/communityDiscussions/${userId}/${communityId}`, { values }).then(axiosResponseBody),
    getCommunityDiscussions: (params: URLSearchParams | undefined, userId: string,  communityId: string) =>
        axios.get(`/api/communityDiscussions/${userId}/${communityId}`, { params }).then(axiosResponseBody),
    
    addCommunityDiscussionMessage: (
        values: CommunityDiscussionMessageDto, 
        userId: string, 
        communityId: string,
        communityDiscussionId: string
    ) =>
        axios.post(`/api/communities/${userId}/${communityId}/${communityDiscussionId}/messages`, { values }).then(axiosResponseBody),
    getCommunityDiscussionForMessageRoom: (
        userId: string, 
        communityId: string,
        communityDiscussionId: string
    ) =>
        axios.get(`/api/communities/${userId}/${communityId}/${communityDiscussionId}`, {  }).then(axiosResponseBody),
    getCommunityDiscussionMessages: (
        params: URLSearchParams | undefined, 
        userId: string, 
        communityId: string,
        communityDiscussionId: string
    ) =>
        axios.get(`/api/communities/${userId}/${communityId}/${communityDiscussionId}/messages`, { params }).then(axiosResponseBody)
}