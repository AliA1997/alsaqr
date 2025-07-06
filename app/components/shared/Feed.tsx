"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
// import { RefreshIcon } from "@heroicons/react/outline";
import type {
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

interface Props {
  title?: string;
  filterKey?: FilterKeys;
  hideTweetBox?: boolean;
  canAdd?: boolean;
  onAdd?: (post: PostToDisplay) => void;
  postsAlreadyAddedByIds?: string[];
}

function FeedContainer({ children }: React.PropsWithChildren<any>) {
  return (
    <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      {children}
    </div>
  );
}


const Feed = observer(({ 
  title, 
  filterKey, 
  hideTweetBox, 
  canAdd,
  onAdd,
  postsAlreadyAddedByIds 
}: Props) => {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { user } = session ?? {};
  const [loading, setLoading] = useState<boolean>(false);
  const { bookmarkFeedStore, exploreStore, feedStore, searchStore } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);
  const loaderRef = useRef(null);

  const feedSetLoadingInitial = useMemo(() => {
    if (filterKey === FilterKeys.Explore) return exploreStore.setLoadingInitial;
    // else if (filterKey === FilterKeys.Search) return searchStore.predicate;
    else return feedStore.setLoadingInitial;
  }, [
    searchStore.searchPostsLoadingInitial,
    feedStore.loadingInitial, 
    exploreStore.loadingInitial, 
    bookmarkFeedStore.loadingInitial
  ]);
  const feedLoadingInitial = useMemo(() => {
    if (filterKey === FilterKeys.Explore) return exploreStore.loadingInitial;
    // else if (filterKey === FilterKeys.Search) return searchStore.predicate;
    else if(filterKey === FilterKeys.MyBookmarks) return bookmarkFeedStore.loadingInitial;
    else return feedStore.loadingInitial;
  }, [
    searchStore.searchPostsLoadingInitial,
    feedStore.loadingInitial, 
    exploreStore.loadingInitial, 
    bookmarkFeedStore.loadingInitial
  ]);

  const setFeedPagingParams = useMemo(() => {
    if (filterKey === FilterKeys.Explore) return exploreStore.setPagingParams;
    else if(filterKey === FilterKeys.MyBookmarks) return bookmarkFeedStore.setPagingParams;
    // else if (filterKey === FilterKeys.Search) return searchStore.predicate;
    else return feedStore.setPagingParams;
  }, [
    searchStore.searchedPostsPagingParams.currentPage,
    feedStore.pagingParams.currentPage, 
    exploreStore.pagingParams.currentPage, 
    bookmarkFeedStore.pagingParams.currentPage
  ]);
  const setFeedPredicate = useMemo(() => {
    if (filterKey === FilterKeys.Explore) return exploreStore.setPredicate;
    else if(filterKey === FilterKeys.MyBookmarks) return bookmarkFeedStore.setPredicate;
    // else if (filterKey === FilterKeys.Search) return searchStore.predicate;
    else return feedStore.setPredicate;
  }, []);
  
  const feedPagingParams = useMemo(() => {
    if (filterKey === FilterKeys.Explore) return exploreStore.pagingParams;
    else if(filterKey === FilterKeys.MyBookmarks) return bookmarkFeedStore.pagingParams;
    // else if (filterKey === FilterKeys.Search) return searchStore.predicate;
    else return feedStore.pagingParams;
  }, [
    searchStore.searchedPostsPagingParams.currentPage,
    feedStore.pagingParams.currentPage, 
    exploreStore.pagingParams.currentPage, 
    bookmarkFeedStore.pagingParams.currentPage
  ]);
  const feedPagination = useMemo(() => {
    if (filterKey === FilterKeys.Explore) return exploreStore.pagination;
    else if(filterKey === FilterKeys.MyBookmarks) return bookmarkFeedStore.pagination;
    else if (filterKey === FilterKeys.SearchPosts) return searchStore.searchedPostsPagination;
    else return feedStore.pagination;
  }, [
    searchStore.searchedPosts,
    searchStore.searchedPostsPagingParams.currentPage, 
    feedStore.posts,
    feedStore.pagingParams.currentPage, 
    exploreStore.explorePosts,
    exploreStore.pagingParams.currentPage, 
    bookmarkFeedStore.bookmarkedPosts,
    bookmarkFeedStore.pagingParams.currentPage
  ]);

  const filterPredicate: Map<string, any> = useMemo(() => {
    if (filterKey === FilterKeys.Explore) return exploreStore.predicate;
    else if(filterKey === FilterKeys.MyBookmarks) return bookmarkFeedStore.predicate;
    else if (filterKey === FilterKeys.SearchPosts) return searchStore.searchedPostsPredicate;
    else return feedStore.predicate;
  }, []);

  const loadPosts = async () => {
    if (filterKey === FilterKeys.Explore)
      return console.log("need to work on this");
    else if(filterKey === FilterKeys.SearchPosts && userId) 
      await searchStore.loadSearchedPosts(userId);
    else if(filterKey === FilterKeys.MyBookmarks && userId) 
      await bookmarkFeedStore.loadBookmarkedPosts(userId);
    else if(filterKey === FilterKeys.Normal)
      await feedStore.loadPosts();
    else
      return console.log();
  }

  async function getPosts() {
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
          
        await loadPosts();
      } finally {
        setLoading(false);
      }
    }, 10000);
  }

  const fetchMoreItems = async (pageNum: number) => {
    setIsLoading(true);
    setFeedPagingParams(new PagingParams(pageNum, 10))
    await loadPosts();
  };


  useEffect(() => {

    if (!filterKey) return;

    getPosts(); 
  }, [searchParams]);

  const loadedPosts = useMemo(() => {

    if (filterKey === FilterKeys.Explore)
      return exploreStore.explorePosts;
    else if(filterKey === FilterKeys.MyBookmarks)
      return bookmarkFeedStore.bookmarkedPosts;
    else if (filterKey === FilterKeys.SearchPosts)
      return searchStore.searchedPosts;
    else
      return feedStore.posts;

  }, [searchStore.searchedPosts, feedStore.posts, exploreStore.explorePosts, bookmarkFeedStore.bookmarkedPosts]);


  // 1. Add this loader component at the end of your posts list
  const LoadMoreTrigger = () => {
    return (
      <div ref={loaderRef} style={{ height: '20px' }}>
        {feedLoadingInitial && <div>Loading more posts...</div>}
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
  const bookmarks = useMemo(() => user ? (user as any)["bookmarks"] : undefined, [session]);
  const reposts = useMemo(() => user ? (user as any)["reposts"] : undefined, [session]);
  const likedPosts = useMemo(() => user ? (user as any)["likedPosts"] : undefined, [session]);

  return (
    <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      {title && <PageTitle>{title}</PageTitle>}
      <div>
        {session && !hideTweetBox && (
          <PostBox filterKey={filterKey ? filterKey : FilterKeys.Normal} />
        )}
      </div>
      <ContentContainerWithRef 
        classNames={`
          text-center overflow-y-auto scrollbar-hide
          ${filterKey === FilterKeys.SearchPosts ? 'min-h-[30vh] max-h-[40vh]' : 'min-h-[100vh] max-h-[100vh]'}  
        `}
        innerRef={containerRef}
      >
        {loading ? (
          <>
            {filterKey === FilterKeys.SearchPosts ? <ModalLoader /> : <CustomPageLoader title="Loading" />}
          </>
        ) : (
          <>
            {loadedPosts && loadedPosts.length 
              ? loadedPosts.map((postRec, postKey) => (
                <PostComponent
                  filterKey={filterKey}
                  key={postRec.post.id ?? postKey}
                  postToDisplay={postRec}
                  onAdd={onAdd}
                  canAdd={canAdd}
                  postsAlreadyAddedByIds={postsAlreadyAddedByIds}
                />
              ))
              : <NoRecordsTitle>No Posts to show</NoRecordsTitle>}
            <LoadMoreTrigger />
          </>
        )}
      </ContentContainerWithRef>
    </div>
  );
});

export { FeedContainer };

export default Feed;
