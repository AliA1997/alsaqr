import { makeAutoObservable, reaction, runInAction } from "mobx";
// import Auth from "../utils/auth"
import { ExploreToDisplay, PostToDisplay } from "../typings.d";
// import { fetchTweets } from "@utils/tweets/fetchTweets";
import { Pagination, PagingParams } from "models/common";
import agent from "@utils/common";
import { faker } from "@faker-js/faker";

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
    newsPagination: Pagination | undefined;
    setLoadingInitial = (value: boolean) => {
        this.loadingInitial = value;
    }
    setPagination = (value: Pagination | undefined) => {
        this.pagination = value;
    }
    setNewsPagination = (value: Pagination | undefined) => {
        this.newsPagination = value;
    }
    predicate = new Map();
    setPredicate = (predicate: string, value: string | number | Date | undefined) => {
        if (predicate)
            this.predicate.set(predicate, value);
        else
            this.predicate.delete(predicate);
    }
    topicToExplore: string = '';
    pagingParams: PagingParams = new PagingParams(1, 10);
    newsPagingParams: PagingParams = new PagingParams(1, 25);

    exploreNewsRegistry: Map<string, ExploreToDisplay> = new Map<string, ExploreToDisplay>();
    explorePostsRegistry: Map<string, PostToDisplay> = new Map<string, PostToDisplay>();

    setPagingParams = (pagingParams: PagingParams) => {
        this.pagingParams = pagingParams;
    }
    setNewsPagingParams = (pagingParams: PagingParams) => {
        this.newsPagingParams = pagingParams;
    }
    setSearchQry = (val: string) => this.predicate.set('searchQry', val);

    setExploreNewsItem = (newsItem: ExploreToDisplay) => {
        this.exploreNewsRegistry.set(newsItem.title, newsItem);
    }
    setExplorePost = (postId: string, post: PostToDisplay) => {
        this.explorePostsRegistry.set(postId, post);
    }

    resetExploreState = () => {
        this.predicate.clear();
        this.explorePostsRegistry.clear();
    }

    get axiosParams() {
        const params = new URLSearchParams();
        params.append("currentPage", this.pagingParams.currentPage.toString());
        params.append("itemsPerPage", this.pagingParams.itemsPerPage.toString());
        this.predicate.forEach((value, key) => params.append(key, value));

        return params;
    }

    get newsAxiosParams() {
        const params = new URLSearchParams();
        params.append("currentPage", this.newsPagingParams.currentPage.toString());
        params.append("itemsPerPage", this.newsPagingParams.itemsPerPage.toString());
        this.predicate.forEach((value, key) => params.append(key, value));

        return params;
    }

    loadExploreNews = async () => {

        this.setLoadingInitial(true);

        try {
            if(this.newsPagingParams.currentPage === 1)
                this.exploreNewsRegistry.clear();
        
            const {result} = await agent.exploreApiClient.getExplore(this.newsAxiosParams);
            
            runInAction(() => {
                result.data.forEach((exploreNewItem: ExploreToDisplay) => {
                    this.setExploreNewsItem(exploreNewItem);
                });
                
                this.setPagination(result.pagination);
            });

        } finally {
            this.setLoadingInitial(false);
            // alert(this.postsRegistry.size)
        }

    }

    // loadExplorePosts = async () => {

    //     this.setLoadingInitial(true);
    //     try {
    //         if(this.pagingParams.currentPage === 1)
    //             this.explorePostsRegistry.clear();

    //         const { explore:explorePostResults } = await agent.exploreApiClient.getExplore(this.axiosParams);

    //         runInAction(() => {
    //             console.log(JSON.stringify(explorePostResults))
    //             explorePostResults.forEach(() => {
    //                 console.log("JSON.stringify(posts):", JSON.stringify(pst.post.id))
    //                 this.setExplorePost(pst.post.id, pst);
    //             });
    //         });
    //     } finally {
    //         this.setLoadingInitial(false);
    //     }

    // }

    get explorePosts() {
        return Array.from(this.explorePostsRegistry.values());
    }

    get exploreNews() {
        return Array.from(this.exploreNewsRegistry.values());
    }
}