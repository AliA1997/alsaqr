import agent from '@utils/common';
import { makeAutoObservable, action, runInAction } from 'mobx';
import { PagingParams } from 'models/common';
import { ProfileUser, User, UserProfileDashboardPosts } from 'typings';

export default class UserStore {
    currentUserProfile: ProfileUser | undefined = undefined;
    currentUserProfilePosts: UserProfileDashboardPosts | undefined = undefined;
    loadingInitial: boolean = false;
    pagingParams = new PagingParams();
    constructor() {
        makeAutoObservable(this);
    }

    setCurrentUserProfile = (userProfileValue: ProfileUser | undefined) => {
        this.currentUserProfile = userProfileValue;
    }
    setCurrentUserProfilePosts = (userProfilePostsValue: UserProfileDashboardPosts | undefined) => {
        this.currentUserProfilePosts = userProfilePostsValue;
    };
    setLoadingInitial = (val: boolean) => {
        this.loadingInitial = val;
    };
    setPagingParams = (val: PagingParams) => {
        this.pagingParams = val;
    }

    get axiosParams() {
        const params = new URLSearchParams();
        params.append("currentPage", this.pagingParams.currentPage.toString());
        params.append("itemsPerPage", this.pagingParams.itemsPerPage.toString());

        return params;
    }

    loadProfile = async (username: string) => {

        this.setLoadingInitial(true);
        let profile;
        try {
            const {user} = await agent.userApiClient.getUserProfile(username);

            runInAction(() => {
                this.setCurrentUserProfile(user);
            });
            profile = user;
        } finally {
            this.setLoadingInitial(false);
        }
        return profile;
    }
    loadProfilePosts = async (userId: string) => {

        this.setLoadingInitial(true);
        try {
            const {profilePosts} = await agent.userApiClient.getUserProfilePosts(userId, this.axiosParams);

            runInAction(() => {
                this.setCurrentUserProfilePosts(profilePosts);
            });
        } finally {
            this.setLoadingInitial(false);
        }
    }

    navigateBackToHome = action(() => {
        window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/`;
    });

}
