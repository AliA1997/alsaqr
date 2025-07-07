"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
// import { RefreshIcon } from "@heroicons/react/outline";
import type {
  CommentToDisplay,
  DashboardPostToDisplay,
  PostToDisplay,
} from "../../../typings";
// import PostComponent from "../posts/Post";
import dynamic from 'next/dynamic';
// import { fetchTweets } from "../../utils/tweets/fetchTweets";
// import toast from "react-hot-toast";

import { useSession } from "next-auth/react";
import PostBox from "../posts/PostBox";
// import { setFilterState } from "@utils/mobx";
import { useSearchParams } from "next/navigation";
import { convertQueryStringToObject, Params } from "@utils/neo4j";
const PostComponent = dynamic(() => import("../posts/Post"), { ssr: false });
const CustomPageLoader = dynamic(() => import("../common/CustomLoader"), { ssr: false });
const ModalLoader = dynamic(() => import("../common/CustomLoader").then(mod => mod.ModalLoader), { ssr: false });
const NoRecordsTitle = dynamic(() => import("../common/Titles").then(mod => mod.NoRecordsTitle), { ssr: false });
const PageTitle = dynamic(() => import("../common/Titles").then(mod => mod.PageTitle), { ssr: false });
// const ContentContainer = dynamic(() => import("../common/Containers").then(mod => mod.ContentContainer), { ssr: false });
const ContentContainerWithRef = dynamic(() => import("../common/Containers").then(mod => mod.ContentContainerWithRef), { ssr: false });

// import CustomPageLoader, { ModalLoader } from "../common/CustomLoader";
import { observer } from "mobx-react-lite";
import { FilterKeys, useStore } from "stores";
// import { NoRecordsTitle, PageTitle } from "../common/Titles";
// import { ContentContainer, ContentContainerWithRef } from "../common/Containers";
import { PagingParams } from "models/common";
import { leadingDebounce } from "@utils/common";
import CommentComponent from "@components/posts/Comment";

interface Props {
  postId: string;
  alreadyLoadedComments?: CommentToDisplay[];
}

function CommentFeedContainer({ children }: React.PropsWithChildren<any>) {
  return (
    <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      {children}
    </div>
  );
}


const CommentFeed = observer(({
  postId,
  alreadyLoadedComments
}: Props) => {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { user } = session ?? {};
  const [loading, setLoading] = useState<boolean>(false);
  const { commentFeedStore } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);
  const loaderRef = useRef(null);

  const feedSetLoadingInitial = useMemo(() => {
    return commentFeedStore.setLoadingInitial;
  }, [
    commentFeedStore.loadingInitial
  ]);
  const feedLoadingInitial = useMemo(() => {
    return commentFeedStore.loadingInitial;
  }, [
    commentFeedStore.loadingInitial
  ]);

  const setFeedPagingParams = useMemo(() => {
    return commentFeedStore.setPagingParams;
  }, [
    commentFeedStore.pagingParams.currentPage
  ]);
  const setFeedPredicate = useMemo(() => {
    return commentFeedStore.setPredicate;
  }, []);

  const feedPagingParams = useMemo(() => {
    return commentFeedStore.pagingParams;
  }, [
    commentFeedStore.pagingParams.currentPage
  ]);
  const feedPagination = useMemo(() => {
    return commentFeedStore.pagination;
  }, [
    commentFeedStore.comments,
    commentFeedStore.pagingParams.currentPage
  ]);

  const filterPredicate: Map<string, any> = useMemo(() => {
    return commentFeedStore.predicate;
  }, [commentFeedStore.predicate]);

  const loadComments = async () => {
    await commentFeedStore.loadComments(postId);
  }

  async function getComments() {
    leadingDebounce(async () => {

      setLoading(true);
      try {
        const paramsFromQryString = convertQueryStringToObject(
          window.location.search
        );

        if (
          (paramsFromQryString.currentPage && paramsFromQryString.itemsPerPage)
          && (paramsFromQryString.currentPage !== filterPredicate.get('currentPage')
            || paramsFromQryString.itemsPerPage !== filterPredicate.get('itemsPerPage')
            || paramsFromQryString.searchTerm != filterPredicate.get('searchTerm'))) {

          setFeedPagingParams(new PagingParams(paramsFromQryString.currentPage, paramsFromQryString.itemsPerPage));
          setFeedPredicate('searchTerm', paramsFromQryString.searchTerm);
        }

        await loadComments();
      } finally {
        setLoading(false);
      }
    }, 10000);
  }

  const fetchMoreItems = async (pageNum: number) => {
    setIsLoading(true);
    setFeedPagingParams(new PagingParams(pageNum, 10))
    await loadComments();
  };


  useEffect(() => {
    getComments();
  }, [searchParams]);

  const loadedComments = useMemo(
    () => commentFeedStore.comments,
    [commentFeedStore.comments]);


  // 1. Add this loader component at the end of your posts list
  const LoadMoreTrigger = () => {
    return (
      <div ref={loaderRef} style={{ height: '20px' }}>
        {feedLoadingInitial && <div>Loading more comments...</div>}
      </div>
    );
  };

  // 2. Fix your Intersection Observer useEffect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        const currentPage = feedPagination?.currentPage ?? 1;
        const itemsPerPage = feedPagination?.itemsPerPage ?? 10;
        const totalItems = feedPagination?.totalItems ?? 0;

        const nextPage = currentPage + 1;
        const totalItemsOnNextPage = nextPage * itemsPerPage;
        const hasMoreItems = (totalItems > totalItemsOnNextPage);
        debugger;
        if (firstEntry?.isIntersecting && !feedLoadingInitial && hasMoreItems) {
          fetchMoreItems(feedPagingParams.currentPage + 1);
        }
      },
      {
        root: containerRef.current,
        rootMargin: '100px',
        threshold: 0.2
      }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [fetchMoreItems]);

  const userId = useMemo(() => user ? (user as any)["id"] : "", [session]);

  return (
    <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      <ContentContainerWithRef
        classNames={`
          text-center overflow-y-auto scrollbar-hide
          min-h-[30vh] max-h-[40vh]
        `}
        innerRef={containerRef}
      >
        {loading ? (
          <ModalLoader />
        ) : (
          <>
            {loadedComments && loadedComments.length
              ? loadedComments.map((commentRec, commentKey) => (
                <CommentComponent
                  key={commentRec.id}
                  commentToDisplay={commentRec}
                  onlyDisplay={false}
                />
              ))
              : <NoRecordsTitle>Be the first comment</NoRecordsTitle>}
            <LoadMoreTrigger />
          </>
        )}
      </ContentContainerWithRef>
    </div>
  );
});

export { CommentFeedContainer };

export default CommentFeed;
