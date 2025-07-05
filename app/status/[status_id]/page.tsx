'use client';
import dynamic from "next/dynamic";
import React, { useEffect, useRef } from "react";
const PostComponent = dynamic(() => import("../../components/posts/Post"), {
  ssr: false,
});

import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import { ContentContainerWithRef } from "@components/common/Containers";
import CustomPageLoader from "@components/common/CustomLoader";

interface StatusPageProps {
  params: {
    status_id: string;
  };
}

const StatusPage = ({ params }: StatusPageProps) => {
  const {feedStore} = useStore();
  const containerRef = useRef(null);

  const { loadPost, loadedPost, loadingPost } = feedStore;
  useEffect(() => {
    loadPost(params.status_id);
  },[params.status_id])

  return (
    <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      <ContentContainerWithRef innerRef={containerRef} style={{ minHeight: '100vh' }}>
        {loadingPost && !loadedPost ? (
          <CustomPageLoader title="Loading" />
        ) : (
          <PostComponent
            postToDisplay={loadedPost!}
          />
        )}
      </ContentContainerWithRef>
    </div>
  );
};


export default observer(StatusPage);