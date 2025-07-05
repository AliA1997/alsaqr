"use client";
import React from "react";
import dynamic from 'next/dynamic';
// import { useGetSession } from "hooks/useGetSession";
// import { FeedContainer } from "@components/shared/Feed";
// import { NoRecordsTitle, PageTitle } from "@components/common/Titles";

// import TweetBox from "@components/posts/PostBox";
import { FilterKeys } from "@stores/index";
// import ListItemComponent from "@components/list/ListItem";
// import { ContentContainer, ContentContainerWithRef } from "@components/common/Containers";
// import { listApiClient } from "@utils/listsApiClient";
import { observer } from "mobx-react-lite";
// import ListOrCommunityBox from "@components/ListOrCommunityBox";
// import { CommonUpsertBoxTypes } from "@typings";
// import { useSession } from "next-auth/react";
const ListOrCommunityFeed = dynamic(() => import("@components/shared/ListOrCommunityFeed"), { ssr: false });
// import ListOrCommunityFeed from "@components/shared/ListOrCommunityFeed";

export default observer(function ListsPage() {
  return <ListOrCommunityFeed filterKey={FilterKeys.Lists} title="Lists" />;
});
