import { makeAutoObservable, reaction, runInAction } from "mobx";
import { ListRecord, ListToDisplay } from "../typings.d";
import { Pagination, PagingParams } from "models/common";
// import { fetchLists } from "@utils/lists/fetchLists";
import agent from "@utils/common";

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

    listsRegistry: Map<string, ListToDisplay> = new Map<string, ListToDisplay>();
    setLoadingInitial = (value: boolean) => {
        this.loadingInitial = value;
    }
    setPagingParams = (pagingParams: PagingParams) => {
        this.pagingParams = pagingParams;
    }
    setPagination = (pagination: Pagination) => {
        this.pagination = pagination;
    }
    setSearchQry = (val: string) => this.predicate.set('searchQry', val);

    
    setList = (tweetId: string, tweet: ListToDisplay) => {
        this.listsRegistry.set(tweetId, tweet);
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

    addList = async (newList: ListRecord, userId: string) => {

        this.setLoadingInitial(true);
        try {
            await agent.listApiClient.addList(newList, userId);
        } finally {
            this.loadingInitial = false;
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

    get lists() {
        return Array.from(this.listsRegistry.values());
    }
}