"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { 
  CommonUpsertBoxTypes,
} from 'models/enums';
import type {
  CommunityToDisplay,
  ListToDisplay,
} from "@typings";
import dynamic from 'next/dynamic';
// import toast from "react-hot-toast";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { convertQueryStringToObject, Params } from "@utils/neo4j";
// import CustomPageLoader from "../common/CustomLoader";
const CustomPageLoader = dynamic(() => import("../common/CustomLoader"), { ssr: false });
import { observer } from "mobx-react-lite";
import { FilterKeys, useStore } from "stores";
const NoRecordsTitle = dynamic(() => import("../common/Titles").then(mod => mod.NoRecordsTitle), { ssr: false });
const PageTitle = dynamic(() => import("../common/Titles").then(mod => mod.PageTitle), { ssr: false });
const ContentContainerWithRef = dynamic(() => import("../common/Containers").then(mod => mod.ContentContainerWithRef), { ssr: false });

// import { NoRecordsTitle, PageTitle } from "../common/Titles";
// import { ContentContainerWithRef } from "../common/Containers";
import { PagingParams } from "models/common";
// import ListOrCommunityBox from "./ListOrCommunityBox";
// import ListItemComponent from "../list/ListItem";
const ListItemComponent = dynamic(() => import("../list/ListItem"), { ssr: false });
const CommunityItemComponent = dynamic(() => import("../community/CommunityItem"), { ssr: false });
const ListOrCommunityUpsertModal = dynamic(() => import("../common/ListOrCommunityUpsertModal"), { ssr: false });
const CommunityDiscussionItemComponent = dynamic(() => import("@components/community/CommunityDiscussionItem"), { ssr: false });

// import CommunityItemComponent from "../community/CommunityItem";
// import ListOrCommunityUpsertModal from "../common/ListOrCommunityUpsertModal";
import type { CommunityDiscussionToDisplay } from "models/community";
// import CommunityDiscussionItemComponent from "@components/community/CommunityDiscussionItem";

interface Props {
  title?: string;
  filterKey?: FilterKeys;
  communityId?: string;
}

function FeedContainer({ children }: React.PropsWithChildren<any>) {
  return (
    <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      {children}
    </div>
  );
}


const ListOrCommunityFeed = observer(({ title, filterKey, communityId }: Props) => {
  const searchParams = useSearchParams();
  const { authStore, modalStore, listFeedStore, communityDiscussionFeedStore, communityFeedStore } = useStore();
  const { currentSessionUser } = authStore;
  const containerRef = useRef(null);
  const loaderRef = useRef(null);


  const setFeedPagingParams = (pagingParams: PagingParams) => {
    if (filterKey === FilterKeys.Explore) return communityFeedStore.setPagingParams(pagingParams);
    else if(filterKey === FilterKeys.CommunityDiscussion) return communityDiscussionFeedStore.setPagingParams(pagingParams);
    else return listFeedStore.setPagingParams(pagingParams);
  };
  const setFeedPredicate = (key: string, value: string | number | Date | undefined) => {
    if (filterKey === FilterKeys.Explore) return communityFeedStore.setPredicate(key, value);
    else if(filterKey === FilterKeys.CommunityDiscussion) return communityDiscussionFeedStore.setPredicate(key, value);
    else return listFeedStore.setPredicate(key, value);
  };

  const feedLoadingInitial = useMemo(() => {
    if (filterKey === FilterKeys.Explore) return communityFeedStore.loadingInitial;
    else if(filterKey === FilterKeys.CommunityDiscussion) return communityDiscussionFeedStore.loadingInitial;
    else return listFeedStore.loadingInitial;
  }, [
    listFeedStore.loadingInitial, 
    communityFeedStore.loadingInitial,
    communityDiscussionFeedStore.loadingInitial
  ]);
  const feedPagingParams = useMemo(() => {
    if (filterKey === FilterKeys.Explore) return communityFeedStore.pagingParams;
    else if(filterKey === FilterKeys.CommunityDiscussion) return communityDiscussionFeedStore.pagingParams;
    else return listFeedStore.pagingParams;
  }, [
    listFeedStore.pagingParams.currentPage, 
    communityFeedStore.pagingParams.currentPage,
    communityDiscussionFeedStore.pagingParams.currentPage
  ]);
  const feedPagination = useMemo(() => {
    if (filterKey === FilterKeys.Explore) return communityFeedStore.pagination;
    else if(filterKey === FilterKeys.CommunityDiscussion) return communityDiscussionFeedStore.pagination;
    else return listFeedStore.pagination;
  }, [
    listFeedStore.pagination?.currentPage, 
    communityFeedStore.pagination?.currentPage,
    communityDiscussionFeedStore.pagination?.currentPage
  ]);
  const filterPredicate: Map<string, any> = useMemo(() => {
    if (filterKey === FilterKeys.Explore) return communityFeedStore.predicate;
    else if(filterKey === FilterKeys.CommunityDiscussion) return communityDiscussionFeedStore.predicate;
    // else if (filterKey === FilterKeys.Search) return searchStore.predicate;
    else return listFeedStore.predicate;
  }, [
    communityFeedStore.predicate,
    communityDiscussionFeedStore.predicate,
    listFeedStore.predicate
  ]);

  async function getPosts() {
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
    }
  }
  const fetchMoreItems = async (pageNum: number) => {
    setFeedPagingParams(new PagingParams(pageNum, 10))
    await loadFeedRecords();
  };
  const loadFeedRecords = async () => {
    if (filterKey === FilterKeys.Community)
      await communityFeedStore.loadCommunities(currentSessionUser?.id ?? 'undefined');
    else if (communityId && filterKey === FilterKeys.CommunityDiscussion)
      await communityDiscussionFeedStore.loadCommunityDiscussions(currentSessionUser?.id ?? 'undefined', communityId!)
    else if (filterKey === FilterKeys.Lists)
      await listFeedStore.loadLists(currentSessionUser?.id ?? 'undefined');
    else
      return console.log();
  }

  useEffect(() => {

    if (!filterKey) return;

    if(currentSessionUser?.id)
      getPosts();
  }, [currentSessionUser?.id]);

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


  console.log('community loadedRecords', JSON.stringify(loadedRecords));

  return (
    <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      {title && <PageTitle>{title}</PageTitle>}
      <div className="flex justify-items-center align-items-center pt-5 px-5">
          <button
              type='button'
              className={`rounded-full bg-maydan px-5 py-2 font-bold text-white disabled:opacity-40`}
              onClick={() => modalStore.showModal(
                              <ListOrCommunityUpsertModal 
                                loggedInUserId={currentSessionUser?.id!} 
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
      {feedLoadingInitial ? (
        <CustomPageLoader title="Loading" />
      ) : (
        <ContentContainerWithRef
          classNames={`
            ${filterKey === FilterKeys.Community || filterKey === FilterKeys.CommunityDiscussion ? 'flex flex-wrap max-w-4xl min-h-100' : ''}
          `}
          innerRef={containerRef}
          
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
                })
                : <NoRecordsTitle>{noRecordsTitle}</NoRecordsTitle>}
              <LoadMoreTrigger />
          </>
        </ContentContainerWithRef>
      )}
    </div>
  );
});


export default ListOrCommunityFeed;
