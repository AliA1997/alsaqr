"use client";
import { useRouter } from "next/navigation";
import React, {
    useRef,
} from "react";
import {
    stopPropagationOnClick,
} from "@utils/neo4j/index";
import { useSession } from "next-auth/react";
import { ExploreToDisplay } from "typings";
import { DotsHorizontalIcon } from "@heroicons/react/outline";

interface Props {
    exploreItem: ExploreToDisplay;
}

function ExploreItemComponent({
    exploreItem,
}: Props) {
    const router = useRouter();

    const navigateToExploreTopics = () => {
        window.open(exploreItem.url, "_blank")
    };

    return (

        <div
            className={`
                    flex flex-wrap relative space-x-0 space-y-0 border-y border-gray-100 hover:shadow-lg dark:border-gray-800 dark:hover:bg-[#000000]
                    max-h-96 max-w-[95%] md:max-w-[50%] cursor-pointer
                `}
            onClick={navigateToExploreTopics}
        >
            {/* <DotsHorizontalIcon className='absolute h-5 w-5 rounded-full bg-gray-900 top-2 right-1 z-20' /> */}
            <div className="w-full h-full overflow-hidden">

                <img
                    className="object-cover"
                    src={exploreItem.urlToImage}
                    alt={exploreItem.url}
                    onClick={(e) => stopPropagationOnClick(e, navigateToExploreTopics)}
                />
            </div>
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-gray-900/20 hover:shadow-lg dark:border-gray-800"></div>

            {/* Text container with padding */}
            <div className="w-full absolute bottom-0 left-0 p-4">
                <h3 className="text-white text-sm font-bold sm:text-xl md:text-xl drop-shadow-lg line-clamp-2">
                    {exploreItem.title}
                </h3>
            </div>
        </div>
    );
}

export default ExploreItemComponent;
