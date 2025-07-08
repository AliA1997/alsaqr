"use client";
import React, { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { FilterKeys, useStore } from "@stores/index";
import { observer } from "mobx-react-lite";
import CustomPageLoader from "@components/common/CustomLoader";
const ListOrCommunityFeed = dynamic(() => import("@components/shared/ListOrCommunityFeed"), { ssr: false });


export default observer(function ListsPage() {
  const { listFeedStore } = useStore();
  const [mounted, setMounted] = useState<boolean>(false);
  const { loadingInitial } = listFeedStore;

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  if(!loadingInitial && mounted)
    return <ListOrCommunityFeed filterKey={FilterKeys.Lists} title="Lists" />;
  
  return <CustomPageLoader title="Loading..." />
});
