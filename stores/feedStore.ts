import { makeAutoObservable, reaction, runInAction } from "mobx";
import Auth from "../utils/auth"
import { Comment, CommentForm, CommentToDisplay, PostRecord, PostToDisplay } from "../typings.d";
import { Pagination, PagingParams } from "models/common";
// import { fetchTweets } from "@utils/tweets/fetchTweets";
import agent from "@utils/common";
import { BookmarkParams, LikedPostParams, RePostParams } from "models/posts";
import { faker } from "@faker-js/faker";

export default class FeedStore {

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
    loadingUpsert = false;
    loadingPost = false;
    loadingComments = false;
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

    postsRegistry: Map<string, PostToDisplay> = new Map<string, PostToDisplay>();
    commentsRegistry: Map<string, Comment> = new Map<string, Comment>();

    loadedPost: PostToDisplay | undefined = undefined;

    setPagingParams = (pagingParams: PagingParams) => {
        this.pagingParams = pagingParams;
    }
    setPagination = (value: Pagination | undefined) => {
        this.pagination = value;
    }
    setSearchQry = (val: string) => this.predicate.set('searchQry', val);


    setPost = (postId: string, post: PostToDisplay) => {
        this.postsRegistry.set(postId, post);
    }
    setComment = (commentId: string, comment: CommentToDisplay) => {
        this.commentsRegistry.set(commentId, comment);
    }

    setLoadingInitial = (value: boolean) => {
        this.loadingInitial = value;
    }
    setLoadingUpsert = (value: boolean) => {
        this.loadingUpsert = value;
    }
    setLoadingPost = (value: boolean) => {
        this.loadingPost = value;
    }
    setLoadingComments = (value: boolean) => {
        this.loadingComments = value;
    }
    setLoadedPost = (value: PostToDisplay) => {
        this.loadedPost = value;
    }


    resetFeedState = () => {
        this.predicate.clear();
        this.postsRegistry.clear();
    }

    get axiosParams() {
        const params = new URLSearchParams();
        params.append("currentPage", this.pagingParams.currentPage.toString());
        params.append("itemsPerPage", this.pagingParams.itemsPerPage.toString());
        this.predicate.forEach((value, key) => params.append(key, value));

        return params;
    }

    loadPosts = async () => {

        this.setLoadingInitial(true);

        try {
            if(this.pagingParams.currentPage === 1)
                this.postsRegistry.clear();
        
            const { result } = await agent.postApiClient.getPosts(this.axiosParams) ?? [];
            
            runInAction(() => {
                result.data.forEach((pst: PostToDisplay) => {
                    this.setPost(pst.post.id, pst);
                });
                console.log('result.pagination:', result.pagination)
                this.setPagination(result.pagination);
            });

        } finally {
            this.setLoadingInitial(false);
            // alert(this.postsRegistry.size)
        }

    }

    addPost = async (newPost: PostRecord) => {

        this.setLoadingInitial(true);
        try {
            await agent.postApiClient.addPost(newPost) ?? {};

        } finally {
            this.setLoadingInitial(false);
        }

    }
    addComment = async (newComment: CommentForm) => {

        this.setLoadingInitial(true);
        try {
            await agent.postApiClient.addComment(newComment) ?? {};

        } finally {
            this.setLoadingInitial(false);
        }

    }
    rePost = async (rePostParams: RePostParams) => {

        this.setLoadingInitial(true);
        try {
            await agent.mutatePostApiClient.rePost(rePostParams) ?? {};

        } finally {
            this.setLoadingInitial(false);
        }

    }
    likedPost = async (likedPostParams: LikedPostParams) => {

        this.setLoadingInitial(true);
        try {
            await agent.mutatePostApiClient.likePost(likedPostParams) ?? {};

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
    deleteYourPost = async (postId: string) => {

        this.setLoadingUpsert(true);
        try {
            await agent.mutatePostApiClient.deleteYourPost(postId) ?? {};

        } finally {
            this.setLoadingUpsert(false);
        }

    }

    loadPost = async (postId: string) => {

        this.setLoadingPost(true);
        try {
            const {post} = await agent.postApiClient.getPost(postId) ?? {};
            console.log('loaded Post:', JSON.stringify(post));
            runInAction(() => {
                this.setLoadedPost(post);
            });
        } finally {
            this.setLoadingPost(false);
        }

    }

    loadComments = async (postId: string) => {

        this.setLoadingComments(true);
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
            this.setLoadingComments(false);
        }
        return results;
    }

    get comments() {
        return Array.from(this.commentsRegistry.values());
    }


    get posts() {
        return Array.from(this.postsRegistry.values());
    }
}