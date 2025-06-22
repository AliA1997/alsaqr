"use client";
import React from "react";
import { useGetSession } from "hooks/useGetSession";
import Feed, { FeedContainer } from "@components/Feed";
import { NoRecordsTitle } from "@components/common/Titles";
import ExploreItemComponent from "@components/explore/ExploreItem";
import { exploreApiClient } from "@utils/exploreApiClient";
import { observer } from "mobx-react-lite";
import { FilterKeys, useStore } from "@stores/index";


export default observer(function ExplorePage() {
  // const { exploreStore } = useStore();
  // const { loadExplorePosts, setPredicate} = exploreStore;

  // const { result: exploreItems } = useGetSession<any[]>(() => {

  // }, false)
  return (
    <React.Suspense fallback={<div>Exploring...</div>}>
      <Feed title="Explore" filterKey={FilterKeys.Explore} />
    </React.Suspense>
  );
});