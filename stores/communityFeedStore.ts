import { makeAutoObservable, reaction, runInAction } from "mobx";
import { CommunityRecord, CommunityToDisplay } from "../typings.d";
import { Pagination, PagingParams } from "models/common";
import { fetchCommunities } from "@utils/communities/fetchCommunities";
import agent from "@utils/common";

export default class CommunityFeedStore {

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

    communityRegistry: Map<string, CommunityToDisplay> = new Map<string, CommunityToDisplay>();

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


    setCommunity = (communityId: string, community: CommunityToDisplay) => {
        this.communityRegistry.set(communityId, community);
    }

    resetListsState = () => {
        this.predicate.clear();
        this.communityRegistry.clear();
    }

    get axiosParams() {
        const params = new URLSearchParams();
        params.append("currentPage", this.pagingParams.currentPage.toString());
        params.append("itemsPerPage", this.pagingParams.itemsPerPage.toString());
        this.predicate.forEach((value, key) => params.append(key, value));

        return params;
    }

    addCommunity = async (newCommunity: CommunityRecord, userId: string) => {

        this.setLoadingInitial(true);
        try {
            await agent.communityApiClient.addCommunity(newCommunity, userId);
        } finally {
            this.setLoadingInitial(false);
        }

    }

    loadCommunities = async (userId: string) => {

        this.setLoadingInitial(true);
        try {
            const { result } = await agent.communityApiClient.getCommunities(this.axiosParams, userId) ?? [];
            runInAction(() => {
                result.data.forEach((community: CommunityToDisplay) => {
                    this.setCommunity(community.community.id, community)
                });
            });

            this.setPagination(result.pagination);
        } finally {
            this.setLoadingInitial(false);
        }

    }

    get communities() {
        return Array.from(this.communityRegistry.values());
    }
}