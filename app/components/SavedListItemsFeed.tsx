"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { convertQueryStringToObject, Params } from "@utils/neo4j";
import CustomPageLoader from "./common/CustomLoader";
import { observer } from "mobx-react-lite";
import { useStore } from "stores";
import { PageTitle } from "./common/Titles";
import { ContentContainerWithRef } from "./common/Containers";
import { PagingParams } from "models/common";
import { ListItemToDisplay } from "models/list";
import SavedListItem from "./SavedListItem";
import ListItemComponent from "./ListItem";

interface Props {
    listName: string;
    listId: string;
}

function FeedContainer({ children }: React.PropsWithChildren<any>) {
  return (
    <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      {children}
    </div>
  );
}


const SavedListItemsFeed = observer(({ listName, listId }: Props) => {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { user } = session ?? {};
  const [loading, setLoading] = useState<boolean>(false);
  const { listFeedStore } = useStore();
  const { 
    savedListItems, 
    loadSavedListItems, 
    loadingListItems, 
    savedListItemsPredicate, 
    setPredicate,
    savedListItemsPagingParams,
    savedListItemsPagination,
    setSavedListItemsPagingParams
} = listFeedStore;
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);
  const loaderRef = useRef(null);

  async function getListItems() {
    setLoading(true);
    try {
      const paramsFromQryString = convertQueryStringToObject(
        window.location.search
      );
      debugger;
      if (
        (paramsFromQryString.currentPage && paramsFromQryString.itemsPerPage)
        && (paramsFromQryString.currentPage !== savedListItemsPredicate.get('currentPage')
          || paramsFromQryString.itemsPerPage !== savedListItemsPredicate.get('itemsPerPage')
          || paramsFromQryString.searchTerm != savedListItemsPredicate.get('searchTerm'))) {
  
        setSavedListItemsPagingParams(new PagingParams(paramsFromQryString.currentPage, paramsFromQryString.itemsPerPage));
        setPredicate('searchTerm', paramsFromQryString.searchTerm);
      }
        
      await loadSavedListItems(userId, listId);
    } finally {
      setLoading(false);
    }
  }

  const fetchMoreItems = async (pageNum: number) => {
    setIsLoading(true);
    setSavedListItemsPagingParams(new PagingParams(pageNum, 10))
    await loadSavedListItems(userId, listId);
  };


  useEffect(() => {
    getListItems();
  }, [searchParams]);



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
        const currentPage = savedListItemsPagination?.currentPage ?? 0;
        const itemsPerPage = savedListItemsPagination?.itemsPerPage ?? 10;
        const totalItems = savedListItemsPagination?.totalItems ?? 0;

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

  const userId = useMemo(() => user ? (user as any)["id"] : "", [session]);

  return (
    <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      <PageTitle>{listName}</PageTitle>
      <ContentContainerWithRef ref={containerRef} style={{ minHeight: '100vh' }}>
        {loading ? (
          <CustomPageLoader title="Loading more list items" />
        ) : (
          <>
            {(savedListItems ?? []).map((savedListItem: ListItemToDisplay, savedListItemKey: number) => {
                if('post' in savedListItem.relatedEntity)
                    return <SavedListItem 
                                key={savedListItem.listItem.id ?? savedListItemKey}
                                id={savedListItem.relatedEntity.post.id}
                                username={savedListItem.relatedEntity.username}
                                userAvatar={savedListItem.relatedEntity.profileImg}
                                dateCreated={savedListItem.relatedEntity.post.createdAt}
                                textOrName={savedListItem.relatedEntity.post.text}
                                image={savedListItem.relatedEntity.post.image}
                                type={savedListItem.relatedEntity.post._type}
                                saved={true} 
                            />
                if('list' in savedListItem.relatedEntity)
                    return <ListItemComponent 
                                key={savedListItem.listItem.id ?? savedListItemKey}
                                listToDisplay={savedListItem.relatedEntity.list} 
                            />

                // if('user' in savedListItem.relatedEntity)
                //     return <SavedListItem 
                //                 key={savedListItem.listItem.id ?? savedListItemKey}
                //                 id={savedListItem.relatedEntity.user.id}
                //                 username={savedListItem.relatedEntity.username}
                //                 userAvatar={savedListItem.relatedEntity.profileImg}
                //                 dateCreated={savedListItem.relatedEntity.post.createdAt}
                //                 textOrName={savedListItem.relatedEntity.post.text}
                //                 image={savedListItem.relatedEntity.post.image}
                //                 type={savedListItem.relatedEntity.post._type}
                //                 saved={true} 
                //             />

                if('community' in savedListItem.relatedEntity)
                    return <SavedListItem 
                                key={savedListItem.listItem.id ?? savedListItemKey}
                                id={savedListItem.relatedEntity.community.id}
                                username={savedListItem.relatedEntity.founder.username}
                                userAvatar={savedListItem.relatedEntity.founder.avatar}
                                dateCreated={savedListItem.relatedEntity.community.createdAt}
                                textOrName={savedListItem.relatedEntity.community.name}
                                image={undefined}
                                type={savedListItem.relatedEntity.community._type}
                                saved={true} 
                            />

                if('communityDiscussion' in savedListItem.relatedEntity)
                    return;
                if('communityDiscussionMsg' in savedListItem.relatedEntity)
                    return;
            })}
            <LoadMoreTrigger />
          </>
        )}
      </ContentContainerWithRef>
    </div>
  );
});

export default SavedListItemsFeed;
