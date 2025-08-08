import { makeAutoObservable, reaction, runInAction } from "mobx";
import { CreateListOrCommunityForm, CreateListOrCommunityFormDto, RelationshipType } from "../typings.d";
import { Pagination, PagingParams } from "models/common";
import agent from "@utils/common";
import type { AcceptOrDenyCommunityInviteConfirmationDto, CommunityDiscussionToDisplay } from "models/community";
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

    loadingJoinCommunityDiscussion = false;
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
    pagingParams: PagingParams = new PagingParams(1, 25);

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
    updateCommunityDiscussionRelationship = (communityDiscussionId: string, newStatus: RelationshipType) => {
        if(this.communityDiscussionsRegistry.has(communityDiscussionId)) {
            const communityDiscussionInfo = this.communityDiscussionsRegistry.get(communityDiscussionId);
            this.setCommunityDiscussion(communityDiscussionId, { ...communityDiscussionInfo!, relationshipType: newStatus });
            console.log('updateCommunityDiscussionRelationship', JSON.stringify(this.communityDiscussionsRegistry.get(communityDiscussionId)))
        }
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
    setLoadingJoinCommunityDiscussion = (val: boolean) => {
        this.loadingJoinCommunityDiscussion = val;
    }


    unjoinPublicCommunityDiscussion = async (communityId: string, communityDiscussionId: string) => {

        this.setLoadingJoinCommunityDiscussion(true);
        try {
            const authUserSession = store.authStore.currentSessionUser;
            const userId = authUserSession?.id ?? "";
            const joinCommunityDiscussionDto = {
                username: authUserSession?.username ?? "",
                email: authUserSession?.email ?? "",
            }
            await agent.communityApiClient.unjoinCommunityDiscussion(joinCommunityDiscussionDto, userId, communityId, communityDiscussionId)

            runInAction(() => {
                this.updateCommunityDiscussionRelationship(communityDiscussionId, RelationshipType.None);
            });
        } finally {
            this.setLoadingJoinCommunityDiscussion(false);
        }

    }
    joinPublicCommunityDiscussion = async (communityId: string, communityDiscussionId: string) => {

        this.setLoadingJoinCommunityDiscussion(true);
        try {
            const authUserSession = store.authStore.currentSessionUser;
            const userId = authUserSession?.id ?? "";
            const joinCommunityDto = {
                username: authUserSession?.username ?? "",
                email: authUserSession?.email ?? "",
            }
            await agent.communityApiClient.joinCommunityDiscussion(joinCommunityDto, userId, communityId, communityDiscussionId)

            runInAction(() => {
                this.updateCommunityDiscussionRelationship(communityDiscussionId, RelationshipType.Joined);
            });
        } finally {
            this.setLoadingJoinCommunityDiscussion(false);
        }

    }
    requestToJoinPrivateCommunityDiscussion = async (communityId: string, communityDiscussionId: string) => {

        this.setLoadingJoinCommunityDiscussion(true);
        try {
            const authUserSession = store.authStore.currentSessionUser;
            const userId = authUserSession?.id ?? "";
            const joinCommunityDto = {
                username: authUserSession?.username ?? "",
                email: authUserSession?.email ?? "",
            }
            await agent.communityApiClient.requestToJoinCommunityDiscussion(joinCommunityDto, userId, communityId, communityDiscussionId)

            runInAction(() => {
                this.updateCommunityDiscussionRelationship(communityDiscussionId, RelationshipType.InviteRequested);
            });
        } finally {
            this.setLoadingJoinCommunityDiscussion(false);
        }

    }
    acceptRequestToJoinPrivateCommunityDiscussion = async (
        communityId: string, 
        communityDiscussionId: string,
        invitedUserId: string,
        acceptToDenyRequest: AcceptOrDenyCommunityInviteConfirmationDto) => {

        this.setLoadingJoinCommunityDiscussion(true);
        try {
            const authUserSession = store.authStore.currentSessionUser;
            const userId = authUserSession?.id ?? "";
            await agent.communityApiClient.acceptOrDenyToJoinRequestToCommunityDiscussion(acceptToDenyRequest, invitedUserId, communityId, communityDiscussionId)

            runInAction(async () => {
                await this.loadCommunityDiscussions(userId, communityId);
            });
        } finally {
            this.setLoadingJoinCommunityDiscussion(false);
        }

    }


    addCommunityDiscussion = async (newCommunityDiscussion: CreateListOrCommunityForm, userId: string, communityId: string) => {

        this.setLoadingUpsert(true);
        try {
            const newCommunityDiscussionDto: CreateListOrCommunityFormDto = {
                ...newCommunityDiscussion,
                postsAdded: [],
                usersAdded: newCommunityDiscussion.usersAdded.map(u => u.user.id)
            };

            await agent.communityApiClient.addCommunityDiscussion(newCommunityDiscussionDto, userId, communityId);
            store.modalStore.closeModal();
            await this.loadCommunityDiscussions(userId, communityId);
            
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