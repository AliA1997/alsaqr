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
import SearchStore from './searchStore';
import CommunityDiscussionFeedStore from './communityDiscussionFeedStore';
import MessageStore from './messageStore';
import SettingsStore from './settingsStore';
import CommentFeedStore from './commentFeedStore';

interface Store {
    authStore: AuthStore;
    bookmarkFeedStore: BookmarkFeedStore;
    commentFeedStore: CommentFeedStore;
    commonStore: CommonStore;
    modalStore: ModalStore;
    exploreStore: ExploreStore;
    feedStore: FeedStore;
    listFeedStore: ListFeedStore;
    communityDiscussionFeedStore: CommunityDiscussionFeedStore;
    communityFeedStore: CommunityFeedStore;
    messageStore: MessageStore;
    notificationStore: NotificationStore;
    searchStore: SearchStore;
    settingsStore: SettingsStore;
    userStore: UserStore;
}


export enum FilterKeys {
  Search = 'search',
  SearchUsers = 'search-users',
  SearchPosts = 'search-posts',
  MyBookmarks = "my-bookmarks",
  Explore = 'explore',
  Normal = 'normal',
  Lists = "lists",
  Community = "community",
  CommunityDiscussion = "community-discussion",
  Register = "register"
}


export const store: Store = {
    authStore: new AuthStore(),
    bookmarkFeedStore: new BookmarkFeedStore(),
    commonStore: new CommonStore(),
    commentFeedStore: new CommentFeedStore(),
    modalStore: new ModalStore(),
    exploreStore: new ExploreStore(),
    feedStore: new FeedStore(),
    listFeedStore: new ListFeedStore(),
    communityDiscussionFeedStore: new CommunityDiscussionFeedStore(),
    communityFeedStore: new CommunityFeedStore(),
    messageStore: new MessageStore(),
    notificationStore: new NotificationStore(),
    searchStore: new SearchStore(),
    settingsStore: new SettingsStore(),
    userStore: new UserStore()
};

export const StoreContext = createContext(store);

export function useStore() {
    return useContext(StoreContext);
}
