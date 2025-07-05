"use client";
import React, { useEffect, useMemo, useRef } from "react";
import dynamic from 'next/dynamic';
import { useSession } from "next-auth/react";

import { useSearchParams } from "next/navigation";
import { convertQueryStringToObject } from "@utils/neo4j";
// import CustomPageLoader from "../common/CustomLoader";
const CustomPageLoader = dynamic(() => import("../common/CustomLoader"), { ssr: false });

import { observer } from "mobx-react-lite";
import { useStore } from "stores";
// import { NoRecordsTitle, PageTitle } from "../common/Titles";
const NoRecordsTitle = dynamic(() => import( "../common/Titles").then(mod => mod.NoRecordsTitle), { ssr: false });
const PageTitle = dynamic(() => import( "../common/Titles").then(mod => mod.PageTitle), { ssr: false });
const ContentContainerWithRef = dynamic(() => import("../common/Containers").then(mod => mod.ContentContainerWithRef), { ssr: false });

import { PagingParams } from "models/common";
// import NotificationItemComponent from "./NotificationItem";
const NotificationItemComponent = dynamic(() => import("./NotificationItem"), { ssr: false });

interface Props {}

const NotificationFeed = observer(({}: Props) => {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { user } = session ?? {};
  const userId = useMemo(() => user ? (user as any)["id"] : "", [session]);

  const { notificationStore } = useStore();
  const { 
    loadNotifications, 
    loadingInitial, 
    setPagingParams, 
    pagingParams,
    setPredicate,
    predicate,
    pagination,
    notifications
 } = notificationStore;

  const containerRef = useRef(null);
  const loaderRef = useRef(null);


  async function getNotifications() {

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
    
      if(userId)
        await loadNotifications(userId);
    } finally {
    }
  }

  const fetchMoreItems = async (pageNum: number) => {
    setPagingParams(new PagingParams(pageNum, 10))
    if(userId)
        await loadNotifications(userId);
  };


  useEffect(() => {
    getNotifications();
  }, [searchParams]);

 
  // 1. Add this loader component at the end of your posts list
  const LoadMoreTrigger = () => {
    return (
      <div ref={loaderRef} style={{ height: '20px' }}>
        {loadingInitial && <div>Loading more notifications...</div>}
      </div>
    );
  };

  // 2. Fix your Intersection Observer useEffect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        const currentPage = pagination?.currentPage ?? 0;
        const itemsPerPage = pagination?.itemsPerPage ?? 10;
        const totalItems = pagination?.totalItems ?? 0;

        const nextPage = currentPage + 1;
        const totalItemsOnNextPage = nextPage * itemsPerPage;
        const hasMoreItems = (totalItems > totalItemsOnNextPage);
        if (firstEntry?.isIntersecting && !loadingInitial && hasMoreItems) {
          fetchMoreItems(pagingParams.currentPage + 1);
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


  return (
    <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      <PageTitle>Your Notifications</PageTitle>

      <ContentContainerWithRef 
        classNames={`
          text-center overflow-y-auto scrollbar-hide min-h-[100vh] max-h-[100vh]
        `}
        ref={containerRef}
      >
        {loadingInitial ? (
          <CustomPageLoader title="Loading" />
        ) : (
          <>
            {notifications && notifications.length 
              ? notifications.map((notificationRecord, notificationKey) => (
                <NotificationItemComponent
                  key={notificationRecord.notification.id ?? notificationKey}
                  notificationToDisplay={notificationRecord}
                />
              ))
              : <NoRecordsTitle>No Notifications to show</NoRecordsTitle>}
            <LoadMoreTrigger />
          </>
        )}
      </ContentContainerWithRef>
    </div>
  );
});


export default NotificationFeed;
