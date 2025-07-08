"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CustomPageLoader from "../common/CustomLoader";
import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import { NoRecordsTitle, PageTitle } from "../common/Titles";
import { ContentContainerWithRef } from "../common/Containers";
import { Pagination, PagingParams } from "models/common";
import ExploreItemComponent from "./ExploreItem";
import { leadingDebounce } from "@utils/common";


interface Props {
}


const ExploreFeed = observer(({  }: Props) => {
    const [_, setLoading] = useState(false);
    const { authStore, exploreStore } = useStore();
    const {
        loadExploreNews,
        loadingInitial,
        exploreNews,
        newsPagination,
        newsPagingParams,
        setNewsPagingParams
    } = exploreStore;
    const containerRef = useRef(null);
    const loaderRef = useRef(null);
    // const [currentPagination, setCurrentPagination] = useState<Pagination | undefined>(newsPagination);
    const feedPagination = useMemo(() => {
        return exploreStore.newsPagination
    }, [
        exploreNews,
        newsPagingParams.currentPage
    ]);
    async function getExploreNews() {
        leadingDebounce(async () => {

            setLoading(true);
            try {

                await loadExploreNews();
            } finally {
                setLoading(false);
            }
        }, 5000);
    }

    const fetchMoreItems = async (pageNum: number) => {
        setNewsPagingParams(new PagingParams(pageNum, 25))
        await loadExploreNews();
    };

    useEffect(() => {
        getExploreNews();
    }, [])

    // 1. Add this loader component at the end of your posts list
    const LoadMoreTrigger = () => {
        return (
            <div ref={loaderRef} style={{ height: '20px' }}>
                {loadingInitial && <div>Loading more news...</div>}
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

                if (firstEntry?.isIntersecting && !loadingInitial && hasMoreItems) {
                fetchMoreItems(newsPagingParams.currentPage + 1);
                }
            },
            {
                root: containerRef.current,
                rootMargin: '100px',
                threshold: 0.3
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
    }, [newsPagingParams, fetchMoreItems]);

    return (
        <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-7 dark:border-gray-800">
            <PageTitle classNames='mb-2'>Explore Popular News</PageTitle>
            <ContentContainerWithRef 
                className='text-center overflow-y-auto scrollbar-hide min-h-[100vh] max-h-[100vh]'
                innerRef={containerRef}>
                {loadingInitial ? (
                    <CustomPageLoader title="Loading" />
                ) : (
                    <>
                        <div className=' flex flex-wrap'>
                            {exploreNews && exploreNews.length
                                ?
                                exploreNews.map((exploreNews, exploreNewsKey: number) => (
                                    <ExploreItemComponent key={exploreNewsKey} exploreItem={exploreNews} />
                                ))
                                : <NoRecordsTitle>No explore news to show.</NoRecordsTitle>}
                        </div>
                        <LoadMoreTrigger />
                    </>
                )}
            </ContentContainerWithRef>
        </div>
    );
});

export default ExploreFeed;
