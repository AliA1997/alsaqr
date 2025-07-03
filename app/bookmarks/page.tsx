"use client";
import React, { useRef } from "react";
import { observer } from "mobx-react-lite";
import { FilterKeys, useStore } from "@stores/index";
import { PagingParams } from "models/common";
import Feed from '@components/shared/Feed';

function BookmarksPage() {
  const containerRef = useRef(null);
  const loaderRef = useRef(null);
  const { authStore, bookmarkFeedStore } = useStore();
  const { currentSessionUser } = authStore;
  const {
    setPagingParams,
    setLoadingInitial,
    predicate,
    pagination,
    loadingInitial,
    bookmarkedPosts,
    loadBookmarkedPosts
  } = bookmarkFeedStore;

  const fetchMoreItems = async (pageNum: number) => {
    setLoadingInitial(true);
    setPagingParams(new PagingParams(pageNum, 10))
    await loadBookmarkedPosts(currentSessionUser?.id!);
  };

  return (
    <Feed title="Bookmarks" filterKey={FilterKeys.MyBookmarks} hideTweetBox={true} />
  );
}

export default observer(BookmarksPage);
