import { makeAutoObservable, reaction, runInAction } from "mobx";
import { CreateListOrCommunityForm, CreateListOrCommunityFormDto, ListRecord, ListToDisplay } from "../typings.d";
import { Pagination, PagingParams } from "models/common";
// import { fetchLists } from "@utils/lists/fetchLists";
import agent from "@utils/common";
import { ListItemToDisplay } from "models/list";
import { DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM } from "@utils/constants";
import { store } from ".";

export default class ListFeedStore {
    
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
    loadingListItems = false;
    predicate = new Map();
    savedListItemsPredicate = new Map();
    setPredicate = (predicate: string, value: string | number | Date | undefined) => {
        if(value) {
            this.predicate.set(predicate, value);
        } else {
            this.predicate.delete(predicate);
        }
    }
    pagingParams: PagingParams = new PagingParams(1, 10);
    pagination: Pagination | undefined = undefined;
    savedListItemsPagingParams: PagingParams = new PagingParams(1, 10);
    savedListItemsPagination: Pagination | undefined = undefined;

    listsRegistry: Map<string, ListToDisplay> = new Map<string, ListToDisplay>();
    savedListItemsRegistry: Map<string, ListItemToDisplay> = new Map<string, ListItemToDisplay>();
    loadingUpsert = false;
    listCreationForm: CreateListOrCommunityForm = DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM;
    currentStepInListCreation: number | undefined = undefined;

    setLoadingUpsert = (value: boolean) => {
        this.loadingUpsert = value;
    }
    setLoadingInitial = (value: boolean) => {
        this.loadingInitial = value;
    }
    setLoadingListItems = (value: boolean) => {
        this.loadingListItems = value;
    }
    setPagingParams = (pagingParams: PagingParams) => {
        this.pagingParams = pagingParams;
    }
    setPagination = (pagination: Pagination) => {
        this.pagination = pagination;
    }
    setSavedListItemsPagingParams = (pagingParams: PagingParams) => {
        this.savedListItemsPagingParams = pagingParams;
    }
    setSavedListItemsPagination = (pagination: Pagination) => {
        this.savedListItemsPagination = pagination;
    }
    setSearchQry = (val: string) => this.predicate.set('searchQry', val);
    setCurrentStepInListCreation = (currentStep: number) => {
        this.currentStepInListCreation = currentStep;
    }
    setListCreationForm = (val: CreateListOrCommunityForm) => {
        this.listCreationForm = val;
    }
    
    setList = (listId: string, list: ListToDisplay) => {
        this.listsRegistry.set(listId, list);
    }
    setSavedListItem = (listItemId: string, listItem: ListItemToDisplay) => {
        this.savedListItemsRegistry.set(listItemId, listItem);
    }
    
    resetPredicate = () => {
        this.predicate.clear();
    }
    resetPagingParams = () => {
        this.pagingParams = new PagingParams(1 , 10);
    }

    resetListsState = () => {
        this.pagingParams = new PagingParams(1, 10);
        this.predicate.clear();
        this.listsRegistry.clear();
    }

    get axiosParams() {
        const params = new URLSearchParams();
        params.append("currentPage", this.pagingParams.currentPage.toString());
        params.append("itemsPerPage", this.pagingParams.itemsPerPage.toString());
        this.predicate.forEach((value, key) => params.append(key, value));

        return params;
    }
    get savedListItemsAxiosParams() {
        const params = new URLSearchParams();
        params.append("currentPage", this.savedListItemsPagingParams.currentPage.toString());
        params.append("itemsPerPage", this.savedListItemsPagingParams.itemsPerPage.toString());
        this.savedListItemsPredicate.forEach((value, key) => params.append(key, value));

        return params;
    }

    addList = async (newList: CreateListOrCommunityForm, userId: string) => {

        this.setLoadingUpsert(true);
        try {
            const newListDto: CreateListOrCommunityFormDto = {
                name: newList.name,
                avatarOrBannerImage: newList.avatarOrBannerImage,
                tags: newList.tags,
                usersAdded: newList.usersAdded.map(u => u.user.id),
                postsAdded: newList.postsAdded.map(p => p.post.id),
                isPrivate: 'private'
            };
            await agent.listApiClient.addList(newListDto, userId)

        } finally {
            this.setLoadingUpsert(false);
        }

    }

    loadLists = async (userId: string) => {
        debugger;
        this.setLoadingInitial(true);
        try {
            const { result } = await agent.listApiClient.getLists(this.axiosParams, userId);
            runInAction(() => {
                result.data.forEach((list: ListToDisplay) => {
                    this.setList(list.list.id, list)
                });
            });

            this.setPagination(result.pagination);
        } finally {
            this.loadingInitial = false;
        }

    }

    loadSavedListItems = async (userId: string, listId: string) => {
        debugger;
        this.setLoadingListItems(true);
        try {
            const { result } = await agent.listApiClient.getSavedListItems(this.savedListItemsAxiosParams, userId, listId);
            runInAction(() => {
                result.data.forEach((listItem: ListItemToDisplay) => {
                    this.setSavedListItem(listItem.listItem.id, listItem)
                });
            });

            this.setSavedListItemsPagination(result.pagination);
        } finally {
            this.setLoadingListItems(false);
        }

    }

    get lists() {
        return Array.from(this.listsRegistry.values());
    }

    get savedListItems() {
        return Array.from(this.savedListItemsRegistry.values());
    }
}