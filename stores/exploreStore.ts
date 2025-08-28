import { makeAutoObservable, reaction, runInAction } from "mobx";
// import Auth from "../utils/auth"
import { ExploreTabs, ExploreToDisplay, PostToDisplay } from "../typings.d";
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
    pagingParams: PagingParams = new PagingParams(1, 25);
    newsPagingParams: PagingParams = new PagingParams(1, 40);

    exploreNewsRegistry: Map<string, ExploreToDisplay> = new Map<string, ExploreToDisplay>();
    ajNewsRegistry: Map<string, ExploreToDisplay> = new Map<string, ExploreToDisplay>();
    argaamNewsRegistry: Map<string, ExploreToDisplay> = new Map<string, ExploreToDisplay>();
    bleacherReportNewsRegistry: Map<string, ExploreToDisplay> = new Map<string, ExploreToDisplay>();
    cryptoCoinNewsRegistry: Map<string, ExploreToDisplay> = new Map<string, ExploreToDisplay>();
    hackerNewsRegistry: Map<string, ExploreToDisplay> = new Map<string, ExploreToDisplay>();
    sabqNewsRegistry: Map<string, ExploreToDisplay> = new Map<string, ExploreToDisplay>();

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
    setAjNewsItem = (newsItem: ExploreToDisplay) => this.ajNewsRegistry.set(newsItem.title, newsItem);
    setArgaamNewsItem = (newsItem: ExploreToDisplay) => this.argaamNewsRegistry.set(newsItem.title, newsItem);
    setBleacherReportNewsItem = (newsItem: ExploreToDisplay) => this.bleacherReportNewsRegistry.set(newsItem.title, newsItem);
    setCryptoCoinNewsItem = (newsItem: ExploreToDisplay) => this.cryptoCoinNewsRegistry.set(newsItem.title, newsItem);
    setHackerNewsItem = (newsItem: ExploreToDisplay) => this.hackerNewsRegistry.set(newsItem.title, newsItem);
    setSabqNewsItem = (newsItem: ExploreToDisplay) => this.sabqNewsRegistry.set(newsItem.title, newsItem);
    
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

    loadAjNews = async () => {
        this.setLoadingInitial(true);
        try {
            if(this.newsPagingParams.currentPage === 1)
                this.exploreNewsRegistry.clear();
        
            const {result} = await agent.exploreApiClient.getExploreFromSource(ExploreTabs.AlJazeeraEnglish, this.newsAxiosParams);
            
            runInAction(() => {
                result.data.forEach((exploreNewItem: ExploreToDisplay) => {
                    this.setAjNewsItem(exploreNewItem);
                });
                
                this.setPagination(result.pagination);
            });

        } finally {
            this.setLoadingInitial(false);
        }
    }

    
    loadArgaamNews = async () => {
        this.setLoadingInitial(true);
        try {
            if(this.newsPagingParams.currentPage === 1)
                this.exploreNewsRegistry.clear();
        
            const {result} = await agent.exploreApiClient.getExploreFromSource(ExploreTabs.Argaam, this.newsAxiosParams);
            
            runInAction(() => {
                result.data.forEach((exploreNewItem: ExploreToDisplay) => {
                    this.setArgaamNewsItem(exploreNewItem);
                });
                
                this.setPagination(result.pagination);
            });

        } finally {
            this.setLoadingInitial(false);
        }
    }
    
    loadBleacherReportNews = async () => {
        this.setLoadingInitial(true);
        try {
            if(this.newsPagingParams.currentPage === 1)
                this.exploreNewsRegistry.clear();
        
            const {result} = await agent.exploreApiClient.getExploreFromSource(ExploreTabs.BleacherReport, this.newsAxiosParams);
            
            runInAction(() => {
                result.data.forEach((exploreNewItem: ExploreToDisplay) => {
                    this.setBleacherReportNewsItem(exploreNewItem);
                });
                
                this.setPagination(result.pagination);
            });

        } finally {
            this.setLoadingInitial(false);
        }
    }
    
    loadCryptoCoinNews = async () => {
        this.setLoadingInitial(true);
        try {
            if(this.newsPagingParams.currentPage === 1)
                this.exploreNewsRegistry.clear();
        
            const {result} = await agent.exploreApiClient.getExploreFromSource(ExploreTabs.CryptoCoinsNews, this.newsAxiosParams);
            
            runInAction(() => {
                result.data.forEach((exploreNewItem: ExploreToDisplay) => {
                    this.setCryptoCoinNewsItem(exploreNewItem);
                });
                
                this.setPagination(result.pagination);
            });

        } finally {
            this.setLoadingInitial(false);
        }
    }
    
    loadHackerNews = async () => {
        this.setLoadingInitial(true);
        try {
            if(this.newsPagingParams.currentPage === 1)
                this.exploreNewsRegistry.clear();
        
            const {result} = await agent.exploreApiClient.getExploreFromSource(ExploreTabs.HackerNews, this.newsAxiosParams);
            
            runInAction(() => {
                result.data.forEach((exploreNewItem: ExploreToDisplay) => {
                    this.setHackerNewsItem(exploreNewItem);
                });
                
                this.setPagination(result.pagination);
            });

        } finally {
            this.setLoadingInitial(false);
        }
    }
    
    loadSabqNews = async () => {
        this.setLoadingInitial(true);
        try {
            if(this.newsPagingParams.currentPage === 1)
                this.exploreNewsRegistry.clear();
        
            const {result} = await agent.exploreApiClient.getExploreFromSource(ExploreTabs.SABQ, this.newsAxiosParams);
            
            runInAction(() => {
                result.data.forEach((exploreNewItem: ExploreToDisplay) => {
                    this.setSabqNewsItem(exploreNewItem);
                });
                
                this.setPagination(result.pagination);
            });

        } finally {
            this.setLoadingInitial(false);
        }
    }

    get explorePosts() {
        return Array.from(this.explorePostsRegistry.values());
    }

    get exploreNews() {
        return Array.from(this.exploreNewsRegistry.values());
    }

    get ajNews() {
        return Array.from(this.ajNewsRegistry.values());
    }

    get argaamNews() {
        return Array.from(this.argaamNewsRegistry.values());
    }

    get bleacherReportNews() {
        return Array.from(this.bleacherReportNewsRegistry.values());
    }

    get cryptoCoinNews() {
        return Array.from(this.cryptoCoinNewsRegistry.values());
    }

    get hackerNews() {
        return Array.from(this.hackerNewsRegistry.values());
    }

    get sabqNews() {
        return Array.from(this.sabqNewsRegistry.values());
    }
}