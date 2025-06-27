import { makeAutoObservable, reaction, runInAction } from "mobx";
import { CommunityRecord, CommunityToDisplay } from "../typings.d";
import { Pagination, PagingParams } from "models/common";
import { fetchCommunities } from "@utils/communities/fetchCommunities";
import agent from "@utils/common";
import { CommunityDiscussionRecord, CommunityDiscussionToDisplay } from "models/community";

export default class CommunityDiscussionFeedStore {

    constructor() {
        makeAutoObservable(this);

        reaction(
            () => this.predicate.keys(),
            () => {
                this.predicate.clear();
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
    pagination: Pagination | undefined = undefined;
    pagingParams: PagingParams = new PagingParams(1, 10);

    communityDiscussionsRegistry: Map<string, CommunityDiscussionToDisplay> = new Map<string, CommunityDiscussionToDisplay>();

    setLoadingInitial = (val: boolean) => {
        this.loadingInitial = val;
    }
    setPagingParams = (pagingParams: PagingParams) => {
        this.pagingParams = pagingParams;
    }
    setPagination = (pagination: Pagination) => {
        this.pagination = pagination;
    }
    setSearchQry = (val: string) => this.predicate.set('searchQry', val);


    setCommunityDiscussion = (communityDiscussionId: string, communityDiscussion: CommunityDiscussionToDisplay) => {
        this.communityDiscussionsRegistry.set(communityDiscussionId, communityDiscussion);
    }

    resetListsState = () => {
        this.predicate.clear();
        this.communityDiscussionsRegistry.clear();
    }

    get axiosParams() {
        const params = new URLSearchParams();
        params.append("currentPage", this.pagingParams.currentPage.toString());
        params.append("itemsPerPage", this.pagingParams.itemsPerPage.toString());
        this.predicate.forEach((value, key) => params.append(key, value));

        return params;
    }

    addCommunityDiscussion = async (newCommunity: CommunityDiscussionRecord, userId: string) => {

        this.setLoadingInitial(true);
        try {
            // await agent.communityApiClient.addCommunity(newCommunity, userId);
        } finally {
            this.setLoadingInitial(false);
        }

    }

    loadCommunityDiscussions = async (userId: string, communityId: string) => {

        this.setLoadingInitial(true);
        try {
            const { result } = await agent.communityApiClient.getCommunity(this.axiosParams, userId, communityId) ?? [];
            runInAction(() => {
                result.data.forEach((communityDiscussion: CommunityDiscussionToDisplay) => {
                    this.setCommunityDiscussion(communityDiscussion.communityDiscussion.id, communityDiscussion)
                });
            });

            this.setPagination(result.pagination);
        } finally {
            this.setLoadingInitial(false);
        }

    }

    get communityDiscussions() {
        return Array.from(this.communityDiscussionsRegistry.values());
    }
}