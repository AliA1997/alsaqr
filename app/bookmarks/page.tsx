"use client";
import React, { useRef } from "react";
import dynamic from "next/dynamic";
import { fetchBookmarks } from "@utils/user/fetchBookmarks";
import { getServerSession } from "next-auth";
import { getEmailUsername } from "@utils/neo4j";
import { redirect } from "next/navigation";
import TweetComponents from "@components/Tweet";
import { FeedContainer } from "@components/Feed";
import { NoRecordsTitle, PageTitle } from "@components/common/Titles";
import { authOptions } from "app/api/auth/[...nextauth]/route";
import { useGetSession } from "hooks/useGetSession";
import { ContentContainer, ContentContainerWithRef } from "@components/common/Containers";
import { observer } from "mobx-react-lite";
import { FilterKeys, useStore } from "@stores/index";
import CustomPageLoader from "@components/common/CustomLoader";
import { Pagination, PagingParams } from "models/common";
import { useSession } from "next-auth/react";
const Feed = dynamic(() => import("@components/Feed"), { ssr: false });

function BookmarksPage() {
  const { data: session } = useSession();
  const { user } = session ?? {};
  const containerRef = useRef(null);
  const loaderRef = useRef(null);
  const { bookmarkFeedStore } = useStore();
  const {
    setPagingParams,
    setLoadingInitial,
    predicate,
    pagination,
    loadingInitial,
    bookmarkedPosts,
    loadBookmarkedPosts
  } = bookmarkFeedStore;
  useGetSession(async (userId: string) => await loadBookmarkedPosts(userId), true)


  const fetchMoreItems = async (pageNum: number) => {
    setLoadingInitial(true);
    setPagingParams(new PagingParams(pageNum, 10))
    await loadBookmarkedPosts(user?.id);
  };



  return (
    <Feed title="Bookmarks" filterKey={FilterKeys.MyBookmarks} hideTweetBox={true} />
  );
}

export default observer(BookmarksPage);
