"use client";
import React, { useRef } from "react";
import { useGetSession } from "hooks/useGetSession";
import { FeedContainer } from "@components/Feed";
import { NoRecordsTitle, PageTitle } from "@components/common/Titles";

import TweetBox from "@components/TweetBox";
import { FilterKeys, useStore } from "@stores/index";
import ListItemComponent from "@components/ListItem";
import { ContentContainer, ContentContainerWithRef } from "@components/common/Containers";
import { listApiClient } from "@utils/listsApiClient";
import { observer } from "mobx-react-lite";
// import ListOrCommunityBox from "@components/ListOrCommunityBox";
import { CommonUpsertBoxTypes } from "@typings";
import { useSession } from "next-auth/react";
import ListOrCommunityFeed from "@components/ListOrCommunityFeed";

export default observer(function ListsPage() {
  return <ListOrCommunityFeed filterKey={FilterKeys.Lists} title="Lists" />;
});
