import { makeAutoObservable, reaction, runInAction } from "mobx";
import { CommunityRecord, CommunityToDisplay, CreateListOrCommunityForm, CreateListOrCommunityFormDto, RelationshipType } from "../typings.d";
import { Pagination, PagingParams } from "models/common";
import agent from "@utils/common";
import {DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM } from "@utils/constants";
import ModalStore from "./modalStore";
import { store } from ".";
import { AcceptOrDenyCommunityInviteConfirmationDto, UpdateCommunityForm, UpdateCommunityFormDto } from "models/community";

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
    loadingUpsert = false;
    loadingJoinCommunity = false;
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

    communityRegistry: Map<string, CommunityToDisplay> = new Map<string, CommunityToDisplay>();
    currentStepInCommunityCreation: number | undefined = undefined;
    communityCreationForm: CreateListOrCommunityForm = DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM;
    currentStepInCommunityUpdate: number | undefined = undefined;
    updateCommunityForm: UpdateCommunityForm | undefined = undefined;


    navigatedCommunity: CommunityToDisplay | undefined = undefined;
    setNavigateCommunity = (val: CommunityToDisplay | undefined) => {
        this.navigatedCommunity = val;
    }
    setLoadingJoinCommunity = (val: boolean) => {
        this.loadingJoinCommunity = val;
    }
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
    setSearchQry = (val: string) => this.predicate.set('searchQry', val);


    setCommunity = (communityId: string, community: CommunityToDisplay) => {
        this.communityRegistry.set(communityId, community);
    }
    private updateCommunityRelationship = (communityId: string, newStatus: RelationshipType) => {
        if(this.communityRegistry.has(communityId)) {
            const communityInfo = this.communityRegistry.get(communityId);
            communityInfo!.relationshipType = newStatus;
            this.setCommunity(communityId, communityInfo!);
        }
    }
    setCurrentStepInCommunityCreation = (currentStep: number) => {
        this.currentStepInCommunityCreation = currentStep;
    }
    setCommunityCreationForm = (val: CreateListOrCommunityForm) => {
        this.communityCreationForm = val;
    }
    setCurrentStepInCommunityUpdate = (currentStep: number) => {
        this.currentStepInCommunityUpdate = currentStep;
    }
    setUpdateCommunityForm = (val: UpdateCommunityForm | undefined) => {
        this.updateCommunityForm = val;
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

    updateCommunity = async (values: UpdateCommunityForm, userId: string, communityId: string) => {

        this.setLoadingUpsert(true);
        try {
            const updatedCommunityDto: UpdateCommunityFormDto = values;

            await agent.communityApiClient.updateCommunity(updatedCommunityDto, userId, communityId);

            runInAction(() => {
                store.modalStore.closeModal();
                this.setCurrentStepInCommunityUpdate(0);
                this.setUpdateCommunityForm(undefined);
            });
        } finally {
            this.setLoadingUpsert(false);
        }

    }

    unjoinPublicCommunity = async (communityId: string) => {

        this.setLoadingJoinCommunity(true);
        try {
            const authUserSession = store.authStore.currentSessionUser;
            const userId = authUserSession?.id ?? "";
            const joinCommunityDto = {
                username: authUserSession?.username ?? "",
                email: authUserSession?.email ?? "",
            }
            await agent.communityApiClient.unjoinCommunity(joinCommunityDto, userId, communityId)

            runInAction(() => {
                this.updateCommunityRelationship(communityId, RelationshipType.None);
            });
        } finally {
            this.setLoadingJoinCommunity(false);
        }

    }
    joinPublicCommunity = async (communityId: string) => {

        this.setLoadingJoinCommunity(true);
        try {
            const authUserSession = store.authStore.currentSessionUser;
            const userId = authUserSession?.id ?? "";
            const joinCommunityDto = {
                username: authUserSession?.username ?? "",
                email: authUserSession?.email ?? "",
            }
            await agent.communityApiClient.joinCommunity(joinCommunityDto, userId, communityId)

            runInAction(() => {
                this.updateCommunityRelationship(communityId, RelationshipType.Joined);
            });
        } finally {
            this.setLoadingJoinCommunity(false);
        }

    }
    requestToJoinPrivateCommunity = async (communityId: string) => {

        this.setLoadingJoinCommunity(true);
        try {
            const authUserSession = store.authStore.currentSessionUser;
            const userId = authUserSession?.id ?? "";
            const joinCommunityDto = {
                username: authUserSession?.username ?? "",
                email: authUserSession?.email ?? "",
            }
            await agent.communityApiClient.requestToJoinCommunity(joinCommunityDto, userId, communityId)

            runInAction(() => {
                this.updateCommunityRelationship(communityId, RelationshipType.InviteRequested);
            });
        } finally {
            this.setLoadingJoinCommunity(false);
        }

    }
    acceptRequestToJoinPrivateCommunity = async (
        communityId: string, 
        invitedUserId: string,
        acceptToDenyRequest: AcceptOrDenyCommunityInviteConfirmationDto) => {

        this.setLoadingJoinCommunity(true);
        try {
            const authUserSession = store.authStore.currentSessionUser;
            const userId = authUserSession?.id ?? "";
            await agent.communityApiClient.acceptOrDenyToJoinRequestToCommunity(acceptToDenyRequest, invitedUserId, communityId)

            runInAction(async () => {
                await this.loadCommunities(userId);
            });
        } finally {
            this.setLoadingJoinCommunity(false);
        }

    }

    addCommunity = async (newCommunity: CreateListOrCommunityForm, userId: string) => {

        this.setLoadingUpsert(true);
        try {
            const newCommunityDto: CreateListOrCommunityFormDto = { 
                ...newCommunity, 
                usersAdded: newCommunity.usersAdded.map(u => u.user.id),
                postsAdded: newCommunity.postsAdded.map(p => p.post.id)
            };
            await agent.communityApiClient.addCommunity(newCommunityDto, userId)
            store.modalStore.closeModal();
            await this.loadCommunities(userId, true);

            runInAction(() => {
                this.setCurrentStepInCommunityCreation(0);
                this.setCommunityCreationForm(DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM);
            });
        } finally {
            this.setLoadingUpsert(false);
        }

    }

    loadCommunities = async (userId: string, refresh?: boolean) => {

        this.setLoadingInitial(true);
        if(refresh) {
            this.communityRegistry.clear();
            this.setPagingParams(new PagingParams(1, 25));
        }
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