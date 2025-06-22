import axios from "axios";
// import { PaginatedResult } from "../models/common";
import { axiosRequests, axiosResponseBody } from "./common";
// import { APIResult, PaginatedResult } from "../models/common";
// import { QueriedAutocompleteOption, WikiPageSearchResult } from "../models/search";
import { ListRecord } from "typings";

export const listApiClient = {
    addList: (values: ListRecord, userId: string) =>
        axiosRequests.post(`/api/lists/${userId}`, { values }).then(axiosResponseBody),     
    getLists: (params: URLSearchParams | undefined, userId: string) =>
        axios.get(`/api/lists/${userId}`, { params }).then(axiosResponseBody)
}