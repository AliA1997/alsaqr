import { makeAutoObservable, reaction, runInAction } from "mobx";
import Auth from "../utils/auth"
import { NotificationToDisplay } from "../typings.d";
import { Pagination, PagingParams } from "models/common";
// import { fetchTweets } from "@utils/tweets/fetchTweets";
import agent from "@utils/common";

export default class NotificationStore {

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

    notificationsRegistry: Map<string, NotificationToDisplay> = new Map<string, NotificationToDisplay>();


    setPagingParams = (pagingParams: PagingParams) => {
        this.pagingParams = pagingParams;
    }
    setPagination = (value: Pagination | undefined) => {
        this.pagination = value;
    }
    setSearchQry = (val: string) => this.predicate.set('searchQry', val);


    setNotification = (notificationId: string, notification: NotificationToDisplay) => {
        this.notificationsRegistry.set(notificationId, notification);
    }
    setLoadingInitial = (value: boolean) => {
        this.loadingInitial = value;
    }

    resetFeedState = () => {
        this.predicate.clear();
        this.notificationsRegistry.clear();
    }

    get axiosParams() {
        const params = new URLSearchParams();
        params.append("currentPage", this.pagingParams.currentPage.toString());
        params.append("itemsPerPage", this.pagingParams.itemsPerPage.toString());
        params.append('all', 'true');
        this.predicate.forEach((value, key) => params.append(key, value));

        return params;
    }

    loadNotifications = async (userId: string) => {

        this.setLoadingInitial(true);
        try {
            const { result } = await agent.notificationApiClient.getNotifications(userId, this.axiosParams) ?? [];

            runInAction(() => {
                result.data.forEach((not: NotificationToDisplay) => {
                    this.setNotification(not.notification.id, not);
                });

            });

            this.setPagination(result.pagination);
        } finally {
            this.setLoadingInitial(false);
        }

    }

    get notifications() {
        return Array.from(this.notificationsRegistry.values());
    }
}