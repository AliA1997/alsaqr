import { makeAutoObservable, reaction, runInAction } from "mobx";
// import Auth from "../utils/auth"
import { PostToDisplay } from "../typings.d";
// import { fetchTweets } from "@utils/tweets/fetchTweets";
import { Pagination, PagingParams } from "models/common";
import agent from "@utils/common";

export default class ExploreStore {
    
    constructor() {
        makeAutoObservable(this);
        
        reaction(
            () => this.predicate.keys(),
            () => {
            }
        );
    }
    
    loadingInitial = false;
    pagination: Pagination | undefined;
    setLoadingInitial = (value: boolean) => {
        this.loadingInitial = value;
    }
    setPagination = (value: Pagination | undefined) => {
        this.pagination = value;
    }
    predicate = new Map();
    setPredicate = (predicate: string, value: string | number | Date | undefined) => {
        if(predicate)
            this.predicate.set(predicate, value);
        else
            this.predicate.delete(predicate);
    }
    topicToExplore: string = '';
    pagingParams: PagingParams = new PagingParams(1, 10);

    explorePostsRegistry: Map<string, PostToDisplay> = new Map<string, PostToDisplay>();

    setPagingParams = (pagingParams: PagingParams) => {
        this.pagingParams = pagingParams;
    }
    setSearchQry = (val: string) => this.predicate.set('searchQry', val);

    
    setExplorePost = (postId: string, post: PostToDisplay) => {
        this.explorePostsRegistry.set(postId, post);
    }

    resetExploreState = () => {
        this.predicate.clear();
        this.explorePostsRegistry.clear();
    }

    get axiosParams() {
        const params = new URLSearchParams();
        params.append("page", this.pagingParams.currentPage.toString());
        params.append("limit", this.pagingParams.itemsPerPage.toString());
        this.predicate.forEach((value, key) => params.append(key, value));

        return params;
    }

    loadExplorePosts = async () => {

        this.setLoadingInitial(true);
        try {
            if(this.pagingParams.currentPage === 1)
                this.explorePostsRegistry.clear();

            const explorePostResults = await agent.exploreApiClient.getExplore(this.axiosParams);
            runInAction(() => {
                explorePostResults.forEach((pst:PostToDisplay) => {
                    console.log("JSON.stringify(posts):", JSON.stringify(pst.post.id))
                    this.setExplorePost(pst.post.id, pst);
                });
            });
        } finally {
            this.setLoadingInitial(false);
        }

    }

    get explorePosts() {
        return Array.from(this.explorePostsRegistry.values());
    }
}