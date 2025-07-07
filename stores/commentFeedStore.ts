import { makeAutoObservable, reaction, runInAction } from "mobx";
import Auth from "../utils/auth"
import { Comment, CommentForm, CommentToDisplay, PostRecord, PostToDisplay } from "../typings.d";
import { Pagination, PagingParams } from "models/common";
// import { fetchTweets } from "@utils/tweets/fetchTweets";
import agent from "@utils/common";
import {  LikedCommentParams, LikedPostParams, RePostCommentParams, RePostParams } from "models/posts";

export default class CommentFeedStore {

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
  
    commentsRegistry: Map<string, CommentToDisplay> = new Map<string, CommentToDisplay>();
    loadedComment: CommentToDisplay | undefined;

    setPagingParams = (pagingParams: PagingParams) => {
        this.pagingParams = pagingParams;
    }
    setPagination = (value: Pagination | undefined) => {
        this.pagination = value;
    }
    setComment = (commentId: string, comment: CommentToDisplay) => {
        this.commentsRegistry.set(commentId, comment);
    }

    setLoadingInitial = (value: boolean) => {
        this.loadingInitial = value;
    }
    setLoadedComment = (val: CommentToDisplay) => {
        this.loadedComment = val;
    }
    setLoadingUpsert = (value: boolean) => {
        this.loadingUpsert = value;
    }

    resetFeedState = () => {
        this.predicate.clear();
        this.commentsRegistry.clear();
    }

    get axiosParams() {
        const params = new URLSearchParams();
        params.append("currentPage", this.pagingParams.currentPage.toString());
        params.append("itemsPerPage", this.pagingParams.itemsPerPage.toString());
        this.predicate.forEach((value, key) => params.append(key, value));

        return params;
    }
    
    
    loadComments = async (postId: string) => {

        this.setLoadingInitial(true);

        try {
            if(this.pagingParams.currentPage === 1)
                this.commentsRegistry.clear();
        
            const { result } = await agent.commentApiClient.getCommentsForPost(this.axiosParams, postId) ?? [];
            
            runInAction(() => {
                result.data.forEach((cmt: CommentToDisplay) => {
                    this.setComment(cmt.id, cmt);
                });
                
                this.setPagination(result.pagination);
            });

        } finally {
            this.setLoadingInitial(false);
        }

    }

    loadComment = async (commentId: string) => {

        this.setLoadingInitial(true);

        try {
            if(this.pagingParams.currentPage === 1)
                this.commentsRegistry.clear();
        
            const { comment } = await agent.commentApiClient.getCommentsById(commentId) ?? [];
            
            alert(JSON.stringify(comment))
            runInAction(() => {
                this.setLoadedComment(comment)
            });

        } finally {
            this.setLoadingInitial(false);
        }

    }

    addComment = async (newComment: CommentForm) => {

        this.setLoadingInitial(true);
        try {
            await agent.commentApiClient.addComment(newComment) ?? {};

        } finally {
            this.setLoadingInitial(false);
        }

    }
    rePostComment = async (rePostCommentParams: RePostCommentParams) => {

        this.setLoadingInitial(true);
        try {
            await agent.commentApiClient.rePostComment(rePostCommentParams.statusId, rePostCommentParams) ?? {};

        } finally {
            this.setLoadingInitial(false);
        }

    }
    likedComment = async (likedPostParams: LikedCommentParams) => {

        this.setLoadingInitial(true);
        try {
            await agent.commentApiClient.likedComment(likedPostParams.statusId, likedPostParams) ?? {};

        } finally {
            this.setLoadingInitial(false);
        }

    }

    deleteYourComment = async (commentId: string) => {

        this.setLoadingUpsert(true);
        try {
            await agent.commentApiClient.deleteComment(commentId) ?? {};

        } finally {
            this.setLoadingUpsert(false);
        }

    }

    get comments() {
        return Array.from(this.commentsRegistry.values());
    }

}