'use client';
import dynamic from "next/dynamic";
import React, { Suspense, useEffect, useRef, useState } from "react";
const TweetComponent = dynamic(() => import("../../components/posts/Post"), {
  ssr: false,
});
import { getServerSession } from "next-auth";
import { postApiClient } from "@utils/postApiClient";
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
    alert("Params Status Id " + params.status_id)
  },[params.status_id])

  return (
    <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      {/* <div className="flex items-center justify-between"> */}
        {/* <h1>User Status</h1> */}
        {/* <p>{JSON.stringify(tweet)}</p> */}
        {/* <Suspense fallback={<h4 className="text-body">Loading...</h4>}>
          <TweetComponent
            postToDisplay={loadingPost ?? {}}
          />
        </Suspense>
      </div> */}
      <ContentContainerWithRef ref={containerRef} style={{ minHeight: '100vh' }}>
        {loadingPost ? (
          <CustomPageLoader title="Loading" />
        ) : (
          <TweetComponent
            postToDisplay={loadedPost!}
          />
        )}
      </ContentContainerWithRef>
    </div>
  );
};


export default observer(StatusPage);