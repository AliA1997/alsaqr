'use client';
import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useRef, useState } from "react";
const PostComponent = dynamic(() => import("../../components/posts/Post"), {
  ssr: false,
});

import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import { ContentContainerWithRef } from "@components/common/Containers";
import CustomPageLoader from "@components/common/CustomLoader";
import CommentComponent from "@components/posts/Comment";

interface StatusPageProps {
  params: {
    status_id: string;
  };
}

const StatusPage = ({ params }: StatusPageProps) => {
  const { commentFeedStore, feedStore} = useStore();
  const containerRef = useRef(null);
  const isComment = useMemo(() => params?.status_id.includes('comment'), [params]);
  const [mounted, setMounted] = useState<boolean>(false);

  const { loadPost, loadedPost, loadingPost } = feedStore;
  const { loadComment, loadedComment, loadingComment } = commentFeedStore;

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    }
  }, [])

  useEffect(() => {
    if(isComment)
      loadComment(params.status_id);
    else
      loadPost(params.status_id);

  },[params.status_id])

  const isLoading = useMemo(() => {
    if(isComment)
      return (loadingComment && !loadedComment);
    else
      return (loadingPost && !loadedPost);
  }, [params.status_id]);


  if(((!isComment && !loadingPost) || (isComment && !loadingComment)) && mounted)
    return (
      <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
        <ContentContainerWithRef innerRef={containerRef} style={{ minHeight: '100vh' }}>
          {isLoading ? (
            <CustomPageLoader title="Loading" />
          ) : (
            <>
              {isComment && loadedComment
                ? (
                  <CommentComponent
                    commentToDisplay={loadedComment}
                    showLabel={true}
                  />
                )
                : loadedPost ? (
                  <PostComponent
                    postToDisplay={loadedPost!}
                    showLabel={true}
                  />
                  )
                  : <div />
              }
            </>
          )}
        </ContentContainerWithRef>
      </div>
    );

  return <CustomPageLoader title='Loading...' />
};


export default observer(StatusPage);