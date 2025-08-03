import axios from "axios";
import { axiosRequests, axiosResponseBody } from "./common";
import { CreateListOrCommunityFormDto } from "typings";
import { AcceptOrDenyCommunityInviteConfirmationDto, CommunityDiscussionMessageDto, CommunityInviteConfirmationDto, UpdateCommunityFormDto } from "models/community";

export const communityApiClient = {
    updateCommunity: (values: UpdateCommunityFormDto, userId: string, communityId: string) =>
        axiosRequests.put(`/api/communities/${userId}/${communityId}`, { values }).then(axiosResponseBody),
    
    requestToJoinCommunity: (values: CommunityInviteConfirmationDto, userId: string, communityId: string) =>
        axiosRequests.post(`/api/communities/${userId}/${communityId}/request-join`, { values }).then(axiosResponseBody),
    acceptOrDenyToJoinRequestToCommunity: (values: AcceptOrDenyCommunityInviteConfirmationDto, userId: string, communityId: string) =>
        axiosRequests.put(`/api/communities/${userId}/${communityId}/request-join`, { values }).then(axiosResponseBody),
    joinCommunity: (values: CommunityInviteConfirmationDto, userId: string, communityId: string) =>
        axiosRequests.put(`/api/communities/${userId}/${communityId}/join`, { values }).then(axiosResponseBody),
    unjoinCommunity: (values: any, userId: string, communityId: string) =>
        axiosRequests.put(`/api/communities/${userId}/${communityId}/unjoin`, { values }).then(axiosResponseBody),
    
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
    
    requestToJoinCommunityDiscussion: (values: CommunityInviteConfirmationDto, userId: string, communityId: string, communityDiscussionId: string) =>
        axiosRequests.post(`/api/communities/${userId}/${communityId}/${communityDiscussionId}/request-join`, { values }).then(axiosResponseBody),
    acceptOrDenyToJoinRequestToCommunityDiscussion: (values: AcceptOrDenyCommunityInviteConfirmationDto, userId: string, communityId: string, communityDiscussionId: string) =>
        axiosRequests.put(`/api/communities/${userId}/${communityId}/${communityDiscussionId}/request-join`, { values }).then(axiosResponseBody),
    joinCommunityDiscussion: (values: CommunityInviteConfirmationDto, userId: string, communityId: string, communityDiscussionId: string) =>
        axiosRequests.put(`/api/communities/${userId}/${communityId}/${communityDiscussionId}/join`, { values }).then(axiosResponseBody),
    unjoinCommunityDiscussion: (values: any, userId: string, communityId: string, communityDiscussionId: string) =>
        axiosRequests.put(`/api/communities/${userId}/${communityId}/${communityDiscussionId}/unjoin`, { values }).then(axiosResponseBody),
    

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