"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
// import { RefreshIcon } from "@heroicons/react/outline";
import {
  CommonUpsertBoxTypes,
  CommunityToDisplay,
  ListToDisplay,
} from "@typings";
// import { fetchTweets } from "../../utils/tweets/fetchTweets";
import toast from "react-hot-toast";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { convertQueryStringToObject, Params } from "@utils/neo4j";
import CustomPageLoader from "../common/CustomLoader";
import { observer } from "mobx-react-lite";
import { FilterKeys, useStore } from "stores";
import { NoRecordsTitle, PageTitle } from "../common/Titles";
import { ContentContainerWithRef } from "../common/Containers";
import { PagingParams } from "models/common";
// import ListOrCommunityBox from "./ListOrCommunityBox";
import ListItemComponent from "../list/ListItem";
import CommunityItemComponent from "../community/CommunityItem";
import ListOrCommunityUpsertModal from "../common/ListOrCommunityUpsertModal";
import { CommunityDiscussionToDisplay } from "models/community";
import CommunityDiscussionItemComponent from "@components/community/CommunityDiscussionItem";

interface Props {
  title?: string;
  filterKey?: FilterKeys;
  hideTweetBox?: boolean;
  communityId?: string;
}

function FeedContainer({ children }: React.PropsWithChildren<any>) {
  return (
    <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      {children}
    </div>
  );
}


const ListOrCommunityFeed = observer(({ title, filterKey, hideTweetBox, communityId }: Props) => {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { user } = session ?? {};
  const userId = useMemo(() => user ? (user as any)["id"] : "", [session]);

  const [loading, setLoading] = useState<boolean>(false);
  const { modalStore, listFeedStore, communityDiscussionFeedStore, communityFeedStore } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);
  const loaderRef = useRef(null);

  const feedSetLoadingInitial = useMemo(() => {
    if (filterKey === FilterKeys.Explore) return communityFeedStore.setLoadingInitial;
    else if(filterKey === FilterKeys.CommunityDiscussion) return communityDiscussionFeedStore.setLoadingInitial;
    else return listFeedStore.setLoadingInitial;
  }, [listFeedStore.loadingInitial, communityFeedStore.loadingInitial]);

  const feedLoadingInitial = useMemo(() => {
    if (filterKey === FilterKeys.Explore) return communityFeedStore.loadingInitial;
    else if(filterKey === FilterKeys.CommunityDiscussion) return communityDiscussionFeedStore.loadingInitial;
    else return listFeedStore.loadingInitial;
  }, [listFeedStore.loadingInitial, communityFeedStore.loadingInitial]);

  const setFeedPagingParams = useMemo(() => {
    if (filterKey === FilterKeys.Explore) return communityFeedStore.setPagingParams;
    else if(filterKey === FilterKeys.CommunityDiscussion) return communityDiscussionFeedStore.setPagingParams;
    else return listFeedStore.setPagingParams;
  }, [listFeedStore.pagingParams.currentPage, communityFeedStore.pagingParams.currentPage]);
  const setFeedPredicate = useMemo(() => {
    if (filterKey === FilterKeys.Explore) return communityFeedStore.setPredicate;
    else if(filterKey === FilterKeys.CommunityDiscussion) return communityDiscussionFeedStore.setPredicate;
    else return listFeedStore.setPredicate;
  }, []);

  const feedPagingParams = useMemo(() => {
    if (filterKey === FilterKeys.Explore) return communityFeedStore.pagingParams;
    else if(filterKey === FilterKeys.CommunityDiscussion) return communityDiscussionFeedStore.pagingParams;
    else return listFeedStore.pagingParams;
  }, [listFeedStore.pagingParams.currentPage, communityFeedStore.pagingParams.currentPage]);
  const feedPagination = useMemo(() => {
    if (filterKey === FilterKeys.Explore) return communityFeedStore.pagination;
    else if(filterKey === FilterKeys.CommunityDiscussion) return communityDiscussionFeedStore.pagination;
    else return listFeedStore.pagination;
  }, [listFeedStore.pagingParams.currentPage, communityFeedStore.pagingParams.currentPage]);

  const filterPredicate: Map<string, any> = useMemo(() => {
    if (filterKey === FilterKeys.Explore) return communityFeedStore.predicate;
    else if(filterKey === FilterKeys.CommunityDiscussion) return communityDiscussionFeedStore.predicate;
    // else if (filterKey === FilterKeys.Search) return searchStore.predicate;
    else return listFeedStore.predicate;
  }, []);

  const loadFeedRecords = async () => {
    if (filterKey === FilterKeys.Community)
      await communityFeedStore.loadCommunities(userId);
    else if (communityId && filterKey === FilterKeys.CommunityDiscussion)
      await communityDiscussionFeedStore.loadCommunityDiscussions(userId, communityId!)
    else if (filterKey === FilterKeys.Lists)
      await listFeedStore.loadLists(userId);
    else
      return console.log();
  }

  async function getPosts() {
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

      await loadFeedRecords();
    } finally {
      setLoading(false);
    }
  }

  const fetchMoreItems = async (pageNum: number) => {
    setIsLoading(true);
    setFeedPagingParams(new PagingParams(pageNum, 10))
    await loadFeedRecords();
  };


  useEffect(() => {

    if (!filterKey) return;

    if(userId)
      getPosts();
  }, [searchParams, userId]);

  const loadedRecords = useMemo(() => {
    // console.log("communityFeedStore.communityRegistry", communityFeedStore.communityRegistry.size)
    if (filterKey === FilterKeys.Community)
      return communityFeedStore.communities;
    else if(filterKey === FilterKeys.CommunityDiscussion)
      return communityDiscussionFeedStore.communityDiscussions;
    else
      return listFeedStore.lists;

  }, [communityFeedStore.loadingInitial, communityDiscussionFeedStore.loadingInitial, listFeedStore.loadingInitial]);


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
        const currentPage = feedPagination?.currentPage ?? 0;
        const itemsPerPage = feedPagination?.itemsPerPage ?? 10;
        const totalItems = feedPagination?.totalItems ?? 0;

        const nextPage = currentPage + 1;
        const totalItemsOnNextPage = nextPage * itemsPerPage;
        const hasMoreItems = (totalItems > totalItemsOnNextPage);
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

  const commonUpsertBoxType = useMemo(() => {
    if(filterKey === FilterKeys.Community) return CommonUpsertBoxTypes.Community;
    else if(filterKey === FilterKeys.CommunityDiscussion) return CommonUpsertBoxTypes.CommunityDiscussion;
    else return CommonUpsertBoxTypes.List;
  }, [filterKey])

  const noRecordsTitle = useMemo(() => {
    if(filterKey === FilterKeys.Community) return 'You are not part of any communities';
    else if(filterKey === FilterKeys.CommunityDiscussion) return 'You are not part of any discussions';
    else return 'You don\'t have any lists';
  }, [filterKey]);

  return (
    <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      {title && <PageTitle>{title}</PageTitle>}
      <div className="flex justify-items-center align-items-center pt-5 px-5">
          <button
              type='button'
              className={`rounded-full bg-maydan px-5 py-2 font-bold text-white disabled:opacity-40`}
              onClick={() => modalStore.showModal(
                              <ListOrCommunityUpsertModal 
                                loggedInUserId={userId} 
                                type={commonUpsertBoxType}
                                communityId={communityId}
                              />
              )}
          >
            {filterKey === FilterKeys.Community ? 'Create Community' 
              : filterKey === FilterKeys.CommunityDiscussion 
                ? 'Create Community Discussion' : 'Create List'}
          </button>
      </div>
      {loading ? (
        <CustomPageLoader title="Loading" />
      ) : (
        <ContentContainerWithRef
          classNames={`${filterKey === FilterKeys.Community || filterKey === FilterKeys.CommunityDiscussion ? 'flex flex-wrap' : ''}`}
          ref={containerRef}
        >
          <>
            {loadedRecords && loadedRecords.length 
              ? loadedRecords.map((record: CommunityToDisplay | ListToDisplay | CommunityDiscussionToDisplay, recordKey) => {
                  let castedRecord: CommunityToDisplay | ListToDisplay | CommunityDiscussionToDisplay;
                  
                  if (filterKey === FilterKeys.Community) {
                    castedRecord = record as CommunityToDisplay;
                    return <CommunityItemComponent
                      key={castedRecord.community.id ?? recordKey}
                      community={castedRecord}
                    />
                  } else if(filterKey === FilterKeys.CommunityDiscussion) {
                    castedRecord = record as CommunityDiscussionToDisplay;
                    return <CommunityDiscussionItemComponent
                              key={castedRecord.communityDiscussion.id ?? recordKey}
                              communityDiscussionToDisplay={castedRecord}
                            />
                  } else {
                    castedRecord = record as ListToDisplay;
                    return <ListItemComponent
                      key={castedRecord.list.id ?? recordKey}
                      listToDisplay={castedRecord}
                    />
                  }
                  <LoadMoreTrigger />
                })
              : <NoRecordsTitle>{noRecordsTitle}</NoRecordsTitle>}
          </>
        </ContentContainerWithRef>
      )}
    </div>
  );
});


export default ListOrCommunityFeed;
