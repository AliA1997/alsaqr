import axios from "axios";
// import { PaginatedResult } from "../models/common";
import { axiosRequests, axiosResponseBody } from "./common";
// import { APIResult, PaginatedResult } from "../models/common";
// import { QueriedAutocompleteOption, WikiPageSearchResult } from "../models/search";
import { CommunityRecord } from "typings";

export const communityApiClient = {
    addCommunity: (values: CommunityRecord, userId: string) =>
        axiosRequests.post(`/api/communities/${userId}`, { values }).then(axiosResponseBody),     
    getCommunities: (params: URLSearchParams | undefined, userId: string) =>
        axios.get(`/api/communities/${userId}`, { params }).then(axiosResponseBody)
}