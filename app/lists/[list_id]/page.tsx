'use client';
import dynamic from "next/dynamic";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
const TweetComponent = dynamic(() => import("../../components/Tweet"), {
  ssr: false,
});
import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import { ContentContainerWithRef } from "@components/common/Containers";
import CustomPageLoader from "@components/common/CustomLoader";
import { useSession } from "next-auth/react";
import SavedListItemsFeed from "@components/SavedListItemsFeed";

interface ListPageProps {
  params: {
    list_id: string;
  };
}

const StatusPage = ({ params }: ListPageProps) => {
  const { data: session } = useSession();    
  const {listFeedStore} = useStore();
  const containerRef = useRef(null);

  const userId = useMemo(() => session?.user ? (session.user as any)["id"] : "", [session]);

  const { loadSavedListItems, loadingListItems } = listFeedStore;
  useEffect(() => {
    loadSavedListItems(userId, params.list_id);
    alert("Params List Id " + params.list_id)
  },[params.list_id])

  return (
    <div />
    // <SavedListItemsFeed listName={} listId={params.list_id} />
  );
};


export default observer(StatusPage);