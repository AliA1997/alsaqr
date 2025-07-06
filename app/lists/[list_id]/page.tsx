'use client';
import dynamic from "next/dynamic";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
const TweetComponent = dynamic(() => import("../../components/posts/Post"), {
  ssr: false,
});
import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import { ContentContainerWithRef } from "@components/common/Containers";
import CustomPageLoader from "@components/common/CustomLoader";
import { useSession } from "next-auth/react";
import SavedListItemsFeed from "@components/list/SavedListItemsFeed";

interface ListPageProps {
  params: {
    list_id: string;
  };
}

const ListPage = ({ params }: ListPageProps) => {
  return (
    <SavedListItemsFeed listId={params.list_id} />
  );
};


export default observer(ListPage);