"use client";
import React, { useEffect, useRef, useState } from "react";
import CustomPageLoader from "../common/CustomLoader";
import { observer } from "mobx-react-lite";
import { useStore } from "stores";
import { NoRecordsTitle, PageTitle } from "../common/Titles";
import { ContentContainerWithRef } from "../common/Containers";
import { PagingParams } from "models/common";
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
        setNewsPagingParams(new PagingParams(pageNum, 10))
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
                const currentPage = newsPagination?.currentPage ?? 1;
                const itemsPerPage = newsPagination?.itemsPerPage ?? 10;
                const totalItems = newsPagination?.totalItems ?? 10;

                const nextPage = currentPage + 1;
                const totalItemsOnNextPage = nextPage * itemsPerPage;
                debugger;
                const hasMoreItems = (totalItems > totalItemsOnNextPage);
                if (firstEntry?.isIntersecting && !loadingInitial && hasMoreItems) {
                    fetchMoreItems(newsPagingParams.currentPage + 1);
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
        <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-7 dark:border-gray-800">
            <ContentContainerWithRef innerRef={containerRef} style={{ minHeight: '100vh' }}>
                {loadingInitial ? (
                    <CustomPageLoader title="Loading" />
                ) : (
                    <>
                        {exploreNews && exploreNews.length
                            ?
                            exploreNews.map((exploreNews, exploreNewsKey: number) => (
                                <ExploreItemComponent key={exploreNewsKey} exploreItem={exploreNews} />
                            ))
                            : <NoRecordsTitle>No explore news to show.</NoRecordsTitle>}
                        <LoadMoreTrigger />
                    </>
                )}
            </ContentContainerWithRef>
        </div>
    );
});

export default ExploreFeed;
