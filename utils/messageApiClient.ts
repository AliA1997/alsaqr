import axios from "axios";
import { MessageFormDto } from "typings";
import { axiosResponseBody } from "./common";


export const messageApiClient = {
    loadDirectMessages: (
        userId: string,
        params: URLSearchParams, 
    ) =>
        axios.get(`/api/messages/${userId}`, { params }).then(axiosResponseBody),
    sendDirectMessage: (
        values: MessageFormDto, 
        userId: string
    ) =>
        axios.post(`/api/messages/${userId}/sendMessage`, { values }).then(axiosResponseBody),
    loadDirectMessageHistory: (
        userId: string,
        params: URLSearchParams, 
    ) =>
        axios.get(`/api/users/${userId}/messages`, { params }).then(axiosResponseBody),
};