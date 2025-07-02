import { makeAutoObservable, reaction, runInAction } from "mobx";
import { CommunityRecord, CommunityToDisplay, CreateListOrCommunityForm, CreateListOrCommunityFormDto } from "../typings.d";
import { Pagination, PagingParams } from "models/common";
import { fetchCommunities } from "@utils/communities/fetchCommunities";
import agent from "@utils/common";
import { CommunityDiscussionRecord, CommunityDiscussionToDisplay } from "models/community";
import { DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM } from "@utils/constants";
import { store } from ".";

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
    loadingUpsert = false;
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
    currentStepInCommunityDiscussionCreation: number | undefined = undefined;
    communityDiscussionCreationForm: CreateListOrCommunityForm = DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM;

    setLoadingInitial = (val: boolean) => {
        this.loadingInitial = val;
    }
    setLoadingUpsert = (val: boolean) => {
        this.loadingUpsert = val;
    }
    setPagingParams = (pagingParams: PagingParams) => {
        this.pagingParams = pagingParams;
    }
    setPagination = (pagination: Pagination) => {
        this.pagination = pagination;
    }
    setCurrentStepInCommunityDiscussionCreation = (val: number) => {
        this.currentStepInCommunityDiscussionCreation = val;
    }
    setCommunityDiscussionCreationForm = (val: CreateListOrCommunityForm) => {
        this.communityDiscussionCreationForm = val;
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

    addCommunityDiscussion = async (newCommunityDiscussion: CreateListOrCommunityForm, userId: string, communityId: string) => {

        this.setLoadingUpsert(true);
        try {
            const newCommunityDiscussionDto: CreateListOrCommunityFormDto = {
                ...newCommunityDiscussion,
                postsAdded: [],
                usersAdded: newCommunityDiscussion.usersAdded.map(u => u.user.id)
            };

            agent.communityApiClient.addCommunityDiscussion(newCommunityDiscussionDto, userId, communityId)
                .then(() => {
                    store.modalStore.closeModal();
                });

            runInAction(() => {
                this.setCommunityDiscussionCreationForm(DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM);
                this.setCurrentStepInCommunityDiscussionCreation(0);
            });
        } finally {
            this.setLoadingUpsert(false);
        }

    }

    loadCommunityDiscussions = async (userId: string, communityId: string) => {

        this.setLoadingInitial(true);
        try {
            const { result } = await agent.communityApiClient.getCommunityDiscussions(this.axiosParams, userId, communityId) ?? [];
            debugger;
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