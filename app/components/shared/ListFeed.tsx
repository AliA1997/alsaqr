"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { 
  CommonUpsertBoxTypes,
} from 'models/enums';
import type {
  ListToDisplay,
} from "@typings";
import dynamic from 'next/dynamic';
import { convertQueryStringToObject } from "@utils/neo4j";

import { observer } from "mobx-react-lite";
import { FilterKeys, useStore } from "@stores/index";
import { PagingParams } from "models/common";
import { PageTitle } from '../common/Titles';

const CustomPageLoader = dynamic(() => import("../common/CustomLoader"), { ssr: false });
const NoRecordsTitle = dynamic(() => import("../common/Titles").then(mod => mod.NoRecordsTitle), { ssr: false });
const ContentContainerWithRef = dynamic(() => import("../common/Containers").then(mod => mod.ContentContainerWithRef), { ssr: false });

const ListItemComponent = dynamic(() => import("../list/ListItem"), { ssr: false });
const ListOrCommunityUpsertModal = dynamic(() => import("../common/ListOrCommunityUpsertModal"), { ssr: false });

interface Props {
}

const ListFeed = observer(({}: Props) => {
  const { authStore, modalStore, listFeedStore } = useStore();
  const { currentSessionUser } = authStore;
  const containerRef = useRef(null);
  const loaderRef = useRef(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const { 
    setPagingParams,
    pagingParams,
    setPredicate,
    predicate,
    pagination,
    loadingInitial,
    lists,
    loadLists
  } = listFeedStore;

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
    await loadLists(currentSessionUser?.id ?? 'undefined');
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
        {loadingInitial && <div>Loading more lists...</div>}
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

  const commonUpsertBoxType = useMemo(() => CommonUpsertBoxTypes.List, [])

  const noRecordsTitle = useMemo(() => 'You don\'t have any lists', []);

  return (
    <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      <PageTitle>Lists</PageTitle>
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
            Create List
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
            {lists && lists.length 
              ? lists.map((record: ListToDisplay, recordKey) => (<ListItemComponent
                                                                    key={record.list.id ?? recordKey}
                                                                    listToDisplay={record}
                                                                  />))
                : <NoRecordsTitle>{noRecordsTitle}</NoRecordsTitle>}
              <LoadMoreTrigger />
          </>
        </ContentContainerWithRef>
      )}
    </div>
  );
});


export default ListFeed;
