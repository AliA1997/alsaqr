"use client";
import { useContext, createContext } from 'react';
import CommonStore from './commonStore';
import ModalStore from './modalStore';
import AuthStore from './authStore';
import ExploreStore from './exploreStore';
import FeedStore from './feedStore';
import ListFeedStore from './listFeedStore';
import CommunityFeedStore from './communityFeedStore';
import NotificationStore from './notificationStore';
import UserStore from './userStore';
import BookmarkFeedStore from './bookmarkFeedStore';

interface Store {
    authStore: AuthStore;
    bookmarkFeedStore: BookmarkFeedStore;
    commonStore: CommonStore;
    modalStore: ModalStore;
    exploreStore: ExploreStore;
    feedStore: FeedStore;
    listFeedStore: ListFeedStore;
    communityFeedStore: CommunityFeedStore;
    notificationStore: NotificationStore;
    userStore: UserStore;
}


export enum FilterKeys {
  Search = 'search',
  MyBookmarks = "my-bookmarks",
  Explore = 'explore',
  Normal = 'normal',
  Lists = "lists",
  Community = "community"
}


export const store: Store = {
    authStore: new AuthStore(),
    bookmarkFeedStore: new BookmarkFeedStore(),
    commonStore: new CommonStore(),
    modalStore: new ModalStore(),
    exploreStore: new ExploreStore(),
    feedStore: new FeedStore(),
    listFeedStore: new ListFeedStore(),
    communityFeedStore: new CommunityFeedStore(),
    notificationStore: new NotificationStore(),
    userStore: new UserStore()
};

export const StoreContext = createContext(store);

export function useStore() {
    return useContext(StoreContext);
}
