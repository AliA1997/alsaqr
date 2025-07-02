import { makeAutoObservable, reaction, runInAction } from "mobx";
import Auth from "../utils/auth"
import { NotificationToDisplay, ProfileUser } from "../typings.d";
import { Pagination, PagingParams } from "models/common";
// import { fetchTweets } from "@utils/tweets/fetchTweets";
import agent from "@utils/common";

export default class MessageStore {

    constructor() {
        makeAutoObservable(this);

        reaction(
            () => this.predicate.keys(),
            () => {
                // this.predicate.clear();
                // this.loadPosts();
            }
        );
    }


    loadingInitial = false;
    predicate = new Map();
    setPredicate = (predicate: string, value: string | number | Date | undefined) => {
        if(value) {
            this.predicate.set(predicate, value);
        } else {
            this.predicate.delete(predicate);
        }
    }
    pagingParams: PagingParams = new PagingParams(1, 10);
    pagination: Pagination | undefined = undefined;
    currentProfileToMessage: ProfileUser | undefined = undefined;

    setPagingParams = (pagingParams: PagingParams) => {
        this.pagingParams = pagingParams;
    }
    setPagination = (value: Pagination | undefined) => {
        this.pagination = value;
    }
    setLoadingInitial = (value: boolean) => {
        this.loadingInitial = value;
    }

    resetFeedState = () => {
        this.predicate.clear();
    }

    setCurrentProfileToMessage = (val: ProfileUser | undefined) => {
        this.currentProfileToMessage = val;
    }
}