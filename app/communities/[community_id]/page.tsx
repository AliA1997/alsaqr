'use client';
import dynamic from "next/dynamic";
import React, { Suspense, useEffect, useRef, useState } from "react";
const PostComponent = dynamic(() => import("../../components/posts/Post"), {
  ssr: false,
});
import { getServerSession } from "next-auth";
import { postApiClient } from "@utils/postApiClient";
import { observer } from "mobx-react-lite";
import { FilterKeys, useStore } from "@stores/index";
import { ContentContainerWithRef } from "@components/common/Containers";
import CustomPageLoader from "@components/common/CustomLoader";
import ListOrCommunityFeed from "@components/shared/ListOrCommunityFeed";

interface CommunityItemPageProps {
  params: {
    community_id: string;
  };
}

const CommunityItemPage = ({ params }: CommunityItemPageProps) => {

  return (
    <ListOrCommunityFeed 
        filterKey={FilterKeys.CommunityDiscussion}
        title="Community Discussions"
        communityId={params.community_id}
    />
  );
};


export default observer(CommunityItemPage);