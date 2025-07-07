import axios from "axios";
// import { PaginatedResult } from "../models/common";
import { axiosRequests, axiosResponseBody } from "./common";
// import { APIResult, PaginatedResult } from "../models/common";
// import { QueriedAutocompleteOption, WikiPageSearchResult } from "../models/search";
import { CreateListOrCommunityFormDto, PostRecord, User } from "typings";
import { values } from "lodash";

export const listApiClient = {
    addList: (values: CreateListOrCommunityFormDto, userId: string) =>
        axiosRequests.post(`/api/lists/${userId}`, { values }).then(axiosResponseBody),
    deleteList: (userId: string, listId: string) =>
        axiosRequests.del(`/api/lists/${userId}/${listId}`).then(axiosResponseBody),
    saveItemToList: (relatedEntityId: string, type: string, userId: string, listId: string) => 
        axiosRequests.patch(`/api/lists/${userId}/${listId}`, { values: { relatedEntityId, type } }).then(axiosResponseBody),
    getLists: (params: URLSearchParams | undefined, userId: string) =>
        axios.get(`/api/lists/${userId}`, { params }).then(axiosResponseBody),
    getSavedListItems: (params: URLSearchParams | undefined, userId: string, listId: string) =>
        axios.get(`/api/lists/${userId}/${listId}`, { params }).then(axiosResponseBody),
    deleteSavedListItem: (userId: string, listId: string, listItemId: string) =>
        axiosRequests.del(`/api/lists/${userId}/${listId}/${listItemId}`).then(axiosResponseBody),
}