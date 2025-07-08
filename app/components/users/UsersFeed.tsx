"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import type {
  UserItemToDisplay,
} from "../../../typings";

import { useSearchParams } from "next/navigation";
import { convertQueryStringToObject } from "@utils/neo4j";
import { ModalLoader } from "../common/CustomLoader";
import { observer } from "mobx-react-lite";
import { FilterKeys, useStore } from "stores";
import { PageTitle } from "../common/Titles";
import { ContentContainerWithRef } from "../common/Containers";
import { PagingParams } from "models/common";
import UserItemComponent from "./UserItem";

interface Props {
  title?: string;
  loggedInUserId?: string;
  filterKey: FilterKeys;
  usersAlreadyAddedOrFollowedByIds: string[];
  onAddOrFollow: (u: UserItemToDisplay) => void;
}

function FeedContainer({ children }: React.PropsWithChildren<any>) {
  return (
    <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      {children}
    </div>
  );
}


const UsersFeed = observer(({ title, loggedInUserId, filterKey, usersAlreadyAddedOrFollowedByIds, onAddOrFollow }: Props) => {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<boolean>(false);
  const { searchStore } = useStore();
  const containerRef = useRef(null);
  const loaderRef = useRef(null);

  const userFeedSetLoadingInitial = useMemo(() => {
    return searchStore.setSearchUsersLoadingInitial;
  }, [searchStore.searchUsersLoadingInitial]);
  const feedLoadingInitial = useMemo(() => {
    return searchStore.searchUsersLoadingInitial;
  }, [searchStore.searchUsersLoadingInitial]);

  const setUserFeedPagingParams = useMemo(() => {
    return searchStore.setSearchedUsersPagingParams
  }, [searchStore.searchedUsersPagingParams.currentPage]);
  const setUserFeedPredicate = useMemo(() => {
    return searchStore.setSearchedUsersPredicate;
  }, []);
  
  const userFeedPagingParams = useMemo(() => {
    return searchStore.searchedUsersPagingParams;
  }, [searchStore.searchedUsersPagingParams.currentPage]);
  const userFeedPagination = useMemo(() => {
    return searchStore.searchedUsersPagination;
  }, [searchStore.searchedUsersPagingParams.currentPage]);

  const userFilterPredicate: Map<string, any> = useMemo(() => {
    return searchStore.searchedUsersPredicate;
  }, []);

  const loadUsers = async () => {
    await searchStore.loadSearchedUsers(loggedInUserId ?? "");
  }

  async function getUsers() {
    setLoading(true);
    try {
      const paramsFromQryString = convertQueryStringToObject(
        window.location.search
      );

      if (
        (paramsFromQryString.currentPage && paramsFromQryString.itemsPerPage)
        && (paramsFromQryString.currentPage !== userFilterPredicate.get('currentPage')
          || paramsFromQryString.itemsPerPage !== userFilterPredicate.get('itemsPerPage')
          || paramsFromQryString.searchTerm != userFilterPredicate.get('searchTerm'))) {
  
        setUserFeedPagingParams(new PagingParams(paramsFromQryString.currentPage, paramsFromQryString.itemsPerPage));
        setUserFeedPredicate('searchTerm', paramsFromQryString.searchTerm);
      }
        
      await loadUsers();
    } finally {
      setLoading(false);
    }
  }

  const fetchMoreItems = async (pageNum: number) => {
    setUserFeedPagingParams(new PagingParams(pageNum, 25))
    await loadUsers();
  };


  useEffect(() => {

    if (!filterKey) return;

    getUsers();
  }, [searchParams]);

  const loadedUsers = useMemo(() => {
    return searchStore.searchedUsers;
  }, [searchStore.searchedUsers]);


  // 1. Add this loader component at the end of your posts list
  const LoadMoreTrigger = () => {
    return (
      <div ref={loaderRef} style={{ height: '20px' }}>
        {feedLoadingInitial && <div>Loading more users...</div>}
      </div>
    );
  };

  // 2. Fix your Intersection Observer useEffect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        const currentPage = userFeedPagination?.currentPage ?? 0;
        const itemsPerPage = userFeedPagination?.itemsPerPage ?? 25;
        const totalItems = userFeedPagination?.totalItems ?? 0;

        const nextPage = currentPage + 1;
        const totalItemsOnNextPage = nextPage * itemsPerPage;
        const hasMoreItems = (totalItems > totalItemsOnNextPage);
        if (firstEntry?.isIntersecting && !feedLoadingInitial && hasMoreItems) {
          fetchMoreItems(userFeedPagingParams.currentPage + 1);
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
    <div 
      className={`
        col-span-7 scrollbar-hide border-x ${filterKey === FilterKeys.SearchUsers || filterKey === FilterKeys.Register ? 'z-[100] max-h-[60vh]' : 'max-h-screen'} 
        lg:col-span-5 dark:border-gray-800
      `}
    >
      {title && <PageTitle>{title}</PageTitle>}
      <div>
        {loggedInUserId && (
            <input 
            className="bg-dim-700 h-10 px-10 pr-5 w-full rounded-full text-sm focus:outline-none bg-maydan-white shadow border-0 dark:bg-gray-800 dark:text-gray-200"
            
            />

        )}
      </div>

        <ContentContainerWithRef 
          classNames={`
            text-center overflow-y-auto scrollbar-hide
            ${filterKey === FilterKeys.SearchUsers || filterKey === FilterKeys.Register ? 'min-h-[30vh] max-h-[40vh]' : 'min-h-[100vh] max-h-[100vh]'}  
          `}
          innerRef={containerRef} 
        >
            {loading ? (
              <ModalLoader />
            ) : (
              <>
                {(loadedUsers ?? []).map((userRec: UserItemToDisplay, userKey) => (
                  <UserItemComponent
                    key={userRec.user.id ?? userKey}
                    loggedInUserId={loggedInUserId}
                    filterKey={filterKey}
                    userItemToDisplay={userRec}
                    usersAlreadyFollowedOrAddedIds={usersAlreadyAddedOrFollowedByIds}
                    onAddOrFollow={onAddOrFollow}
                    canAddOrFollow={true}
                    onModal={true}
                  />
                ))}
                <LoadMoreTrigger />
              </>
            )}
        </ContentContainerWithRef>
    </div>
  );
});

export { FeedContainer };

export default UsersFeed;
