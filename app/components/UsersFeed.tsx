"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { RefreshIcon } from "@heroicons/react/outline";
import {
  DashboardPostToDisplay,
  PostToDisplay,
  User,
  UserItemToDisplay,
} from "../../typings";
import TweetComponents from "./Tweet";
// import { fetchTweets } from "../../utils/tweets/fetchTweets";
import toast from "react-hot-toast";

import { useSession } from "next-auth/react";
import TweetBox from "./TweetBox";
import { setFilterState } from "@utils/mobx";
import { useSearchParams } from "next/navigation";
import { convertQueryStringToObject, Params } from "@utils/neo4j";
import CustomPageLoader from "./common/CustomLoader";
import { observer } from "mobx-react-lite";
import { FilterKeys, useStore } from "stores";
import { PageTitle } from "./common/Titles";
import { ContentContainer, ContentContainerWithRef } from "./common/Containers";
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
    <div className={`col-span-7 scrollbar-hide border-x ${filterKey === FilterKeys.SearchUsers ? 'max-h-[60vh]' : 'max-h-screen'} overflow-scroll lg:col-span-5 dark:border-gray-800`}>
      {title && <PageTitle>{title}</PageTitle>}
      <div>
        {loggedInUserId && (
            <input 
            className="bg-dim-700 h-10 px-10 pr-5 w-full rounded-full text-sm focus:outline-none bg-maydan-white shadow border-0 dark:bg-gray-800 dark:text-gray-200"
            
            />

        )}
      </div>
      <ContentContainerWithRef className='text-center' ref={containerRef} style={{ minHeight: '100vh' }}>
        {loading ? (
            <svg
                aria-hidden="true"
                className="inline w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-maydan
                "
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                />
                <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                />
            </svg>
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
