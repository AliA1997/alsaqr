"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { ExploreToDisplay } from "typings";
import { OptimizedNewsImage } from "@components/common/Image";
import { stopPropagationOnClick } from "@utils/neo4j";

interface Props {
    exploreItem: ExploreToDisplay;
}

function ExploreItemComponent({
    exploreItem,
}: Props) {

    const navigateToExploreTopics = () => {
        window.open(exploreItem.url, "_blank")
    };

    return (

        <div
            className={`
                    flex flex-wrap relative space-x-0 space-y-0 border-y border-gray-100 hover:shadow-lg dark:border-gray-800 dark:hover:bg-[#000000]
                    mr-1 max-h-96 w-[90%] md:w-[48%] lg:w-[32%] cursor-pointer
                `}
            style={{ transform: 'scale: 0.8' }}
        >
            <div className="w-full h-full overflow-hidden">

                <OptimizedNewsImage
                    src={exploreItem.urlToImage}
                    alt={exploreItem.url}
                />
            </div>
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-gray-900/20 hover:shadow-lg dark:border-gray-800">
            </div>
            {/* Text container with padding */}
            <div 
                className="w-full absolute bottom-0 left-0 p-4"
                onClick={e => stopPropagationOnClick(e, navigateToExploreTopics)}
            >
                <h6 className="text-white text-sm font-bold sm:text-lg md:text-md drop-shadow-lg line-clamp-2 hover:underline">
                    {exploreItem.title}
                </h6>
            </div>

        </div>
    );
}

export default ExploreItemComponent;
