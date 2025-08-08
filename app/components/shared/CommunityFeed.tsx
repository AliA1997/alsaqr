"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { 
  CommonUpsertBoxTypes,
} from 'models/enums';
import type {
  CommunityToDisplay,
} from "@typings";
import dynamic from 'next/dynamic';
import { convertQueryStringToObject } from "@utils/neo4j";

import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import { PagingParams } from "models/common";
import { PageTitle } from '../common/Titles';

const CustomPageLoader = dynamic(() => import("../common/CustomLoader"), { ssr: false });
const NoRecordsTitle = dynamic(() => import("../common/Titles").then(mod => mod.NoRecordsTitle), { ssr: false });
const ContentContainerWithRef = dynamic(() => import("../common/Containers").then(mod => mod.ContentContainerWithRef), { ssr: false });

const CommunityItemComponent = dynamic(() => import("../community/CommunityItem"), { ssr: false });
const ListOrCommunityUpsertModal = dynamic(() => import("../common/ListOrCommunityUpsertModal"), { ssr: false });

interface Props {
}

const CommunityFeed = observer(({ }: Props) => {
  const { authStore, modalStore, communityFeedStore } = useStore();
  const { currentSessionUser } = authStore;
  const containerRef = useRef(null);
  const loaderRef = useRef(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const {
    pagingParams,
    setPagingParams,
    pagination,
    predicate,
    setPredicate,
    loadingInitial,
    loadCommunities,
    communities
   } = communityFeedStore;

  async function getPosts() {
    try {
      const paramsFromQryString = convertQueryStringToObject(
        window.location.search
      );


      if (
        (paramsFromQryString.currentPage && paramsFromQryString.itemsPerPage)
        && (paramsFromQryString.currentPage !== predicate.get('currentPage')
          || paramsFromQryString.itemsPerPage !== predicate.get('itemsPerPage')
          || paramsFromQryString.searchTerm != predicate.get('searchTerm'))) {

        setPagingParams(new PagingParams(paramsFromQryString.currentPage, paramsFromQryString.itemsPerPage));
        setPredicate('searchTerm', paramsFromQryString.searchTerm);
      }

      await loadFeedRecords();
    } finally {
    }
  }
  const fetchMoreItems = async (pageNum: number) => {
    setPagingParams(new PagingParams(pageNum, 25))
    await loadFeedRecords();
  };
  const loadFeedRecords = async () => {
    await loadCommunities(currentSessionUser?.id ?? 'undefined');
  }

  useEffect(() => {

    if(currentSessionUser?.id) {
      getPosts();
      setMounted(true);
    }

    return () => {
      setMounted(false);
    }
  }, [currentSessionUser?.id]);

  // 1. Add this loader component at the end of your posts list
  const LoadMoreTrigger = () => {
    return (
      <div ref={loaderRef} style={{ height: '20px' }}>
        {loadingInitial && <div>Loading more communities...</div>}
      </div>
    );
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        const currentPage = pagination?.currentPage ?? 0;
        const itemsPerPage = pagination?.itemsPerPage ?? 25;
        const totalItems = pagination?.totalItems ?? 0;

        const nextPage = currentPage + 1;
        const totalItemsOnNextPage = nextPage * itemsPerPage;
        const hasMoreItems = (totalItems > totalItemsOnNextPage);
        if (firstEntry?.isIntersecting && !loadingInitial && hasMoreItems && mounted) {
          fetchMoreItems(pagingParams.currentPage + 1);
        }
      },
      {
        root: containerRef.current,
        rootMargin: '100px',
        threshold: 0.1
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
  }, []);

  const commonUpsertBoxType = useMemo(() => CommonUpsertBoxTypes.Community, [])

  const noRecordsTitle = useMemo(() => 'You are not part of any communities', []);

  return (
    <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      <PageTitle>Communities</PageTitle>
      <div className="flex justify-items-center align-items-center pt-5 px-5">
          <button
              type='button'
              className={`rounded-full bg-maydan px-5 py-2 font-bold text-white disabled:opacity-40`}
              onClick={() => modalStore.showModal(
                              <ListOrCommunityUpsertModal 
                                loggedInUserId={currentSessionUser?.id!} 
                                type={commonUpsertBoxType}
                              />
              )}
          >
            Create Community
          </button>
      </div>
      {loadingInitial || !mounted ? (
        <CustomPageLoader title="Loading" />
      ) : (
        <ContentContainerWithRef
          classNames='flex flex-wrap min-h-100 md:justify-start'
          innerRef={containerRef}
        >
          <>
            {communities && communities.length 
              ? communities.map((record: CommunityToDisplay, recordKey) => <CommunityItemComponent
                                                                                key={record.community.id ?? recordKey}
                                                                                community={record}
                                                                            />)
                : <NoRecordsTitle>{noRecordsTitle}</NoRecordsTitle>}
              <LoadMoreTrigger />
          </>
        </ContentContainerWithRef>
      )}
    </div>
  );
});


export default CommunityFeed;
