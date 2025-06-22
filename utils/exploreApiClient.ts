import axios from "axios";
import { axiosResponseBody } from "./common";

export const exploreApiClient = {
    getExplore: (params: URLSearchParams) =>
        axios.get(`/api/explore`, { params }).then(axiosResponseBody)
};