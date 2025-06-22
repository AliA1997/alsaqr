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
        router.push(`explore`);
    };

    return (
        <div
            className="flex flex-col relative space-x-0 lg:space-x-3 space-y-1 lg:space-y-3 border-y border-gray-100 hover:shadow-lg dark:border-gray-800 dark:hover:bg-[#000000]"
            onClick={navigateToExploreTopics}
        >
            <DotsHorizontalIcon className='absolute h-5 w-5 rounded-full bg-gray-900 top-2 right-1 z-20' />
            <img
                className="w-full h-full object-cover"
                src={exploreItem.urlToImage}
                alt={exploreItem.url}
                onClick={(e) => stopPropagationOnClick(e, navigateToExploreTopics)}
            />
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-gray-900/20"></div>

            {/* Text container with padding */}
            <div className="w-full absolute bottom-0 left-0 p-4">
                <h3 className="text-white text-xs font-bold sm:text-xl md:text-2xl drop-shadow-lg">
                    {exploreItem.title}
                </h3>
            </div>
        </div>
    );
}

export default ExploreItemComponent;
