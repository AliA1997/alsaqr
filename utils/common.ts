import { NextRequest } from "next/server";
import axios, { AxiosResponse, AxiosError } from 'axios';
import { PaginatedResult } from '../models/common';
import { exploreApiClient } from "./exploreApiClient";
import { listApiClient } from "./listsApiClient";
import { mutatePostApiClient } from "./mutatePostApiClient";
import { postApiClient } from "./postApiClient";
import { notificationApiClient } from "./notificationApiClient";
import { userApiClient } from "./userApiClient";
import { communityApiClient } from "./communityApiClient";
import { messageApiClient } from "./messageApiClient";


export const extractQryParams = (request: NextRequest, paramsToExtract: string[]): (string | null)[] => {
    const qryParams = new URL(request.url!).searchParams;

    // console.log('paramsToExtract', paramsToExtract)
    // console.log('qryParams.get(itemsPerPage)', qryParams.get('itemsPerPage'))

    let results = (paramsToExtract ?? []).map((p: string) => {
      // console.log('p', p);
      let valToReturn: string | null = '';
      if(p === 'currentPage')
        valToReturn = qryParams.get(p) ?? '1'
      else if(p === 'itemsPerPage')
        valToReturn = qryParams.get(p) ?? '25'
      else
        valToReturn = qryParams.get(p);

      // console.log('valToReturn:', valToReturn)
      return valToReturn;
    });
    // console.log("RESULTS:", results)
    return results;
}

export const axiosResponseBody = (res: AxiosResponse) => res.data;

export const axiosRequests = {
  get: <T>(url: string) => axios.get<T>(url).then(axiosResponseBody),
  post: <T>(url: string, body: {}) =>
    axios.post<T>(url, body).then(axiosResponseBody),
  put: <T>(url: string, body: {}) => axios.put<T>(url, body).then(axiosResponseBody),
  patch: <T>(url: string, body: {}) => axios.patch<T>(url, body).then(axiosResponseBody),
  del: <T>(url: string) => axios.delete<T>(url).then(axiosResponseBody),
};

axios.defaults.baseURL = process.env.NEXT_PUBLIC_BASE_URL;

console.log("NEXT_PUBLIC_BASE_URL", process.env.NEXT_PUBLIC_BASE_URL)


// Middleware Configuration for Axios
// axios.interceptors.request.use((config) => {
//   if (config.url !== import.meta.env.REACT_APP_IP_ADDRESS_LOOKUP) {
//     const token = store.commonStore.token;
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

axios.interceptors.response.use(
  async (response) => {
    const pagination = response.headers["pagination"];
    if (pagination) {
      response.data = new PaginatedResult(
        response.data,
        JSON.parse(pagination)
      );
      return response as AxiosResponse<PaginatedResult<any>>;
    }
    return response;
  },
  (error: AxiosError) => {
    const myResponse = error.response as AxiosResponse;
    const modalStateErrors = [];
    if (!myResponse?.status) {
      // modalStateErrors.push(i18n.t(error.message, { ns: "errors" }));
      return Promise.reject("Error");
    }

    switch (myResponse.status) {
      case 400:
        if (
          myResponse.config.method === "get" &&
          myResponse.data.errors.hasOwnProperty("id")
        ) {
          console.log("Not found")
          // router.navigate("/not-found");
        }
        if (myResponse.data.errors) {
          for (const key in myResponse.data.errors) {
            if (myResponse.data.errors[key]) {
              modalStateErrors.push(
                // i18n.t(myResponse.data.errors[key], { ns: "errors" })
                'Errors'
              );
            }
          }
          throw modalStateErrors.flat();
        } else {
          // modalStateErrors.push(i18n.t(myResponse.data, { ns: "errors" }));
          // throw modalStateErrors.flat();
        }
      case 401:
        // router.navigate("/");
        // if (store.userStore.user) store.userStore.logout();
        if (myResponse.data === "invalid_token") {
        //   toast.error(i18n.t("expired_session", { ns: "errors" }).toString());
        } else {
          // modalStateErrors.push(i18n.t(myResponse.data, { ns: "errors" }));
          // throw modalStateErrors.flat();
        }
        break;
      case 403:
        // router.navigate("/");
        // if (store.userStore.user) store.userStore.logout();
        break;
      case 404:
        // router.navigate("/not-found");
        break;
      case 413:
        // modalStateErrors.push(i18n.t("UploadTooLarge", { ns: "errors" }));
        // throw modalStateErrors.flat();
      case 418:  //I am a teapot!
        //need to update user
        // store.userStore.getUser();
        break;
      case 500:
        // store.commonStore.setServerError(myResponse.data);
        // router.navigate("/server-error");
        break;
      default:
        // store.commonStore.setServerError(myResponse.status + myResponse.data);
        // router.navigate("/server-error");
        break;
    }

    return Promise.reject(error);
  }
);


const agent = {
  communityApiClient,
  exploreApiClient,
  listApiClient,
  postApiClient,
  messageApiClient,
  mutatePostApiClient,
  notificationApiClient,
  userApiClient
};
export function leadingDebounce<F extends (...args: any[]) => any>(
  func: F,
  delay: number
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  // alert(timeoutId)
  if (!timeoutId) {
    func();
  }
  
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  
  timeoutId = setTimeout(() => {
    timeoutId = null;
  }, delay);
}

export default agent;