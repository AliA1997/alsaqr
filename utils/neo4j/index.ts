import { PostToDisplay } from "typings";

export interface Params {
  currentPage?: number;
  itemsPerPage?: number;
  searchTerm?: string;
}

const returnRegex = /(\bRETURN\b)([\s\S]*?)(;|$)/i;
export const commonCountCipher = (origSelectCipher: string, recordName: string) => {
  const commonCipher = origSelectCipher.replace(returnRegex, `RETURN count(${recordName}) as total`);
  return commonCipher;
}

export function retrieveQueryString(params: Params | undefined) {
  let queryString = "?";
  if (params) {
    if (params.currentPage) queryString += `page=${params.currentPage}&`;
    if (params.itemsPerPage) queryString += `limit=${params.itemsPerPage}`;
    if (params.searchTerm) queryString += `searchTerm=${params.searchTerm}&`;
  }
  return queryString;
}

export function convertQueryStringToObject(queryString: string) {
  // Convert the query string to an object
  const queryParams = new URLSearchParams(queryString);

  // Create an object to hold the parameters
  const paramsObject: any = {};

  // Loop through each parameter and add it to the object
  for (let [key, value] of queryParams) {
    paramsObject[key] = value;
  }

  return {
    currentPage: paramsObject["currentPage"],
    itemsPerPage: paramsObject["itemsPerPage"],
    searchTerm: paramsObject["searchTerm"],
  } as Params;
}

export function stopPropagationOnClick<T>(
  e: React.MouseEvent<T>,
  callback: Function
) {
  e.stopPropagation();
  callback();
}

export const nonRoutableTitles = ["Sign In", "Sign Out", "More"];

export function getEmailUsername(email: string): string {
  const [username] = email.split("@");
  return username;
}

export const defaultSearchParams = {
  page: 1,
  limit: 20,
  search_term: "",
};

export const isPostSearchAMatch = (
  pst: PostToDisplay,
  searchQry: string
): boolean => {
  return (
    pst.post.text.includes(searchQry) ||
    pst.post.id === searchQry ||
    pst.commenters.some((c) => c.username === searchQry)
  );
};

export function getPercievedNumberOfRecord<T>(
  stateBool: boolean,
  origBool: boolean,
  loadedNumberOfRecords: T[]
) {
  if(stateBool && !origBool)
    return loadedNumberOfRecords.length + 1
  else if(!stateBool && origBool)
    return loadedNumberOfRecords.length - 1
  else
    return loadedNumberOfRecords.length;
}
