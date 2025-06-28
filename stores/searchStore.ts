import { makeAutoObservable, reaction, runInAction } from "mobx";
import Auth from "../utils/auth"
import { Comment, CommentToDisplay, PostRecord, PostToDisplay, User, UserInfo, UserItemToDisplay } from "../typings";
import { Pagination, PagingParams } from "models/common";
// import { fetchTweets } from "@utils/tweets/fetchTweets";
import agent from "@utils/common";
import { BookmarkParams, LikedPostParams, RePostParams } from "models/posts";

export default class SearchStore {

    constructor() {
        makeAutoObservable(this);

        reaction(
            () => this.searchedUsersPredicate.keys(),
            () => {
                // this.predicate.clear();
                // this.loadPosts();
            }
        );
    }


    searchUsersLoadingInitial = false;
    searchPostsLoadingInitial = false;

    loadingPost = false;
    searchedUsersPredicate = new Map();
    searchedPostsPredicate = new Map();
    setSearchedUsersPredicate = (predicate: string, value: string | number | Date | undefined) => {
        if(value) {
            this.searchedUsersPredicate.set(predicate, value);
        } else {
            this.searchedUsersPredicate.delete(predicate);
        }
    }
    searchedUsersPagingParams: PagingParams = new PagingParams(1, 25);
    searchedUsersPagination: Pagination | undefined = undefined;
    searchedPostsPagingParams: PagingParams = new PagingParams(1, 25);
    searchedPostsPagination: Pagination | undefined = undefined;

    searchUsersRegistry: Map<string, UserItemToDisplay> = new Map<string, UserItemToDisplay>();
    searchPostsRegistry: Map<string, PostToDisplay> = new Map<string, PostToDisplay>();

    setSearchedUsersPagingParams = (pagingParams: PagingParams) => {
        this.searchedUsersPagingParams = pagingParams;
    }
    setSearchedUsersPagination = (value: Pagination | undefined) => {
        this.searchedUsersPagination = value;
    }
    setSearchedPostsPagingParams = (pagingParams: PagingParams) => {
        this.searchedPostsPagingParams = pagingParams;
    }
    setSearchedPostsPagination = (value: Pagination | undefined) => {
        this.searchedPostsPagination = value;
    }


    setSearchedUser = (userId: string, user: UserItemToDisplay) => {
        this.searchUsersRegistry.set(userId, user);
    }
    setSearchedPost = (postId: string, post: PostToDisplay) => {
        this.searchPostsRegistry.set(postId, post);
    }

    setSearchUsersLoadingInitial = (value: boolean) => {
        this.searchUsersLoadingInitial = value;
    }
    setSearchPostsLoadingInitial = (value: boolean) => {
        this.searchPostsLoadingInitial = value;
    }
   
    get searchUsersAxiosParams() {
        const params = new URLSearchParams();
        params.append("currentPage", this.searchedUsersPagingParams.currentPage.toString());
        params.append("itemsPerPage", this.searchedUsersPagingParams.itemsPerPage.toString());
        this.searchedUsersPredicate.forEach((value, key) => params.append(key, value));

        return params;
    }
    get searchPostsAxiosParams() {
        const params = new URLSearchParams();
        params.append("currentPage", this.searchedPostsPagingParams.currentPage.toString());
        params.append("itemsPerPage", this.searchedPostsPagingParams.itemsPerPage.toString());
        this.searchedPostsPredicate.forEach((value, key) => params.append(key, value));

        return params;
    }

    loadSearchedUsers = async (userId: string) => {

        this.setSearchUsersLoadingInitial(true);

        try {
            if(this.searchedUsersPagingParams.currentPage === 1)
                this.searchUsersRegistry.clear();
            
            console.log('userId:', userId);
            const { result } = await agent.userApiClient.getUsersToAdd(userId, this.searchUsersAxiosParams) ?? [];

            console.log('result:', result);
            debugger;
            runInAction(() => {
                result.data.forEach((userItem: UserItemToDisplay) => {
                    this.setSearchedUser(userItem.user.id, userItem);
                });
            });

            this.setSearchedUsersPagination(result.pagination);
        } finally {
            this.setSearchUsersLoadingInitial(false);
        }

    }
    loadSearchedPosts = async (userId: string) => {

        this.setSearchPostsLoadingInitial(true);

        try {
            if(this.searchedPostsPagingParams.currentPage === 1)
                this.searchUsersRegistry.clear();
            
            console.log('userId:', userId);
            const { result } = await agent.postApiClient.getPostsToAdd(userId, this.searchPostsAxiosParams) ?? [];

            console.log('result:', result);
            debugger;
            runInAction(() => {
                result.data.forEach((postItem: PostToDisplay) => {
                    this.setSearchedPost(postItem.post.id, postItem);
                });
            });

            this.setSearchedPostsPagination(result.pagination);
        } finally {
            this.setSearchPostsLoadingInitial(false);
        }

    }

    get searchedUsers() {
        return Array.from(this.searchUsersRegistry.values());
    }
    get searchedPosts() {
        return Array.from(this.searchPostsRegistry.values());
    }
}