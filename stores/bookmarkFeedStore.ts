import { makeAutoObservable, reaction, runInAction } from "mobx";
import Auth from "../utils/auth"
import { Comment, CommentToDisplay, PostRecord, PostToDisplay } from "../typings.d";
import { Pagination, PagingParams } from "models/common";
// import { fetchTweets } from "@utils/tweets/fetchTweets";
import agent from "@utils/common";
import { BookmarkParams } from "models/posts";

export default class BookmarkFeedStore {

    constructor() {
        makeAutoObservable(this);

        reaction(
            () => this.predicate.keys(),
            () => {
                // this.predicate.clear();
                // this.loadPosts();
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

    bookmarkedPostsRegistry: Map<string, PostToDisplay> = new Map<string, PostToDisplay>();
    commentsRegistry: Map<string, Comment> = new Map<string, Comment>();

    loadedBookmarkedPost: PostToDisplay | undefined = undefined;

    setPagingParams = (pagingParams: PagingParams) => {
        this.pagingParams = pagingParams;
    }
    setPagination = (value: Pagination | undefined) => {
        this.pagination = value;
    }

    setBookmarkedPost = (postId: string, post: PostToDisplay) => {
        this.bookmarkedPostsRegistry.set(postId, post);
    }
    setComment = (commentId: string, comment: CommentToDisplay) => {
        this.commentsRegistry.set(commentId, comment);
    }

    setLoadingInitial = (value: boolean) => {
        this.loadingInitial = value;
    }
    setLoadedBookmarkedPost = (value: PostToDisplay) => {
        this.loadedBookmarkedPost = value;
    }


    resetBookmarksFeedState = () => {
        this.predicate.clear();
        this.bookmarkedPostsRegistry.clear();
    }

    get axiosParams() {
        const params = new URLSearchParams();
        params.append("currentPage", this.pagingParams.currentPage.toString());
        params.append("itemsPerPage", this.pagingParams.itemsPerPage.toString());
        this.predicate.forEach((value, key) => params.append(key, value));

        return params;
    }

    loadBookmarkedPosts = async (sessionUserId: string) => {

        this.setLoadingInitial(true);

        try {
            if(this.pagingParams.currentPage === 1)
                this.bookmarkedPostsRegistry.clear();
        
            const { result } = await agent.postApiClient.getBookmarkedPosts(this.axiosParams, sessionUserId) ?? [];

            runInAction(() => {
                result.data.forEach((pst: PostToDisplay) => {
                    this.setBookmarkedPost(pst.post.id, pst);
                });
                debugger;
            });

            this.setPagination(result.pagination);
        } finally {
            this.setLoadingInitial(false);
        }

    }

    bookmarkPost = async (bookmarkParams: BookmarkParams) => {

        this.setLoadingInitial(true);
        try {
            await agent.mutatePostApiClient.bookmarkPost(bookmarkParams) ?? {};

        } finally {
            this.setLoadingInitial(false);
        }

    }

    loadPost = async (postId: string) => {

        this.setLoadingInitial(true);
        try {
            const post = await agent.postApiClient.getPost(postId) ?? {};

            runInAction(() => {
                this.setLoadedBookmarkedPost(post);
            });
        } finally {
            this.setLoadingInitial(false);
        }

    }

    loadComments = async (postId: string) => {

        this.setLoadingInitial(true);
        let results: CommentToDisplay[] = [];
        try {
            const comments = await agent.postApiClient.getComments(postId) ?? {};

            runInAction(() => {
                comments.forEach((cmt: CommentToDisplay) => {
                    this.setComment(cmt.id, cmt);
                });
            });

            results = comments;
        } finally {
            this.setLoadingInitial(false);
        }
        return results;
    }

    get comments() {
        return Array.from(this.commentsRegistry.values());
    }


    get bookmarkedPosts() {
        return Array.from(this.bookmarkedPostsRegistry.values());
    }
}