"use client";
import React, { useEffect, useRef, useState } from "react";

import CustomPageLoader from "../common/CustomLoader";
import { observer } from "mobx-react-lite";
import { useStore } from "stores";
import { NoRecordsTitle, PageTitle } from "../common/Titles";
import { ContentContainerWithRef } from "../common/Containers";
import { PagingParams } from "models/common";
import SavedListItem from "./SavedListItem";

interface Props {
  listId: string;
}


const SavedListItemsFeed = observer(({  listId }: Props) => {
  const [_, setLoading] = useState(false);
  const { authStore, listFeedStore } = useStore();
  const {
    savedListItems,
    listInfoForSavedListItems,
    loadSavedListItems,
    loadingListItems,
    savedListItemsPagingParams,
    savedListItemsPagination,
    setSavedListItemsPagingParams
  } = listFeedStore;
  const { currentSessionUser } = authStore;
  const containerRef = useRef(null);
  const loaderRef = useRef(null);

    async function getListItems() {
      setLoading(true);
      try {

        await loadSavedListItems(currentSessionUser?.id ?? '', listId);
      } finally {
        setLoading(false);
      }
  }

  const fetchMoreItems = async (pageNum: number) => {
    setSavedListItemsPagingParams(new PagingParams(pageNum, 10))
    await loadSavedListItems(currentSessionUser?.id!, listId);
  };

  useEffect(() => {
    if(currentSessionUser?.id)
      getListItems();
  }, [currentSessionUser])

  // 1. Add this loader component at the end of your posts list
  const LoadMoreTrigger = () => {
    return (
      <div ref={loaderRef} style={{ height: '20px' }}>
        {loadingListItems && <div>Loading more list items...</div>}
      </div>
    );
  };

  // 2. Fix your Intersection Observer useEffect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        const currentPage = savedListItemsPagination?.currentPage ?? 1;
        const itemsPerPage = savedListItemsPagination?.itemsPerPage ?? 10;
        const totalItems = savedListItemsPagination?.totalItems ?? 10;

        const nextPage = currentPage + 1;
        const totalItemsOnNextPage = nextPage * itemsPerPage;
        const hasMoreItems = (totalItems > totalItemsOnNextPage);
        if (firstEntry?.isIntersecting && !loadingListItems && hasMoreItems) {
          fetchMoreItems(savedListItemsPagingParams.currentPage + 1);
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

  // alert(savedListItems.length)
  return (
    <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-7 dark:border-gray-800">
      <PageTitle>{listInfoForSavedListItems?.name ?? ""}</PageTitle>
      <ContentContainerWithRef innerRef={containerRef} style={{ minHeight: '100vh' }}>
        {loadingListItems ? (
          <CustomPageLoader title="Loading" />
        ) : (
          <>
            {savedListItems && savedListItems.length 
                ?
                savedListItems.map((savedListItem, savedListItemKey: number) => (
                  <SavedListItem key={savedListItem.listItem.id} savedListItemToDisplay={savedListItem} />
                ))
                : <NoRecordsTitle>No saved items for this list.</NoRecordsTitle>}
            <LoadMoreTrigger />
          </>
        )}
      </ContentContainerWithRef>
    </div>
  );
});

export default SavedListItemsFeed;
