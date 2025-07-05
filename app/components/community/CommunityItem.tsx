"use client";
import { useRouter } from "next/navigation";
import React, {
  useLayoutEffect,
  useRef,
} from "react";
import TimeAgo from "react-timeago";

import type { CommunityToDisplay } from "../../../typings";
import {
  stopPropagationOnClick,
} from "@utils/neo4j/index";
import { useSession } from "next-auth/react";
import { useStore } from "@stores/index";
import { convertDateToDisplay } from "@utils/neo4j/neo4j";
import { TagOrLabel } from "@components/common/Titles";

interface Props {
  community: CommunityToDisplay;
}

function CommunityItemComponent({
  community,
}: Props) {
  const router = useRouter();
  const { data: session } = useSession();

  const { communityFeedStore } = useStore();
  const { setNavigateCommunity } = communityFeedStore;

  const initiallyBooleanValues = useRef<{
    joined: boolean;
    commented: boolean;
  }>({
    joined: false,
    commented: false,
  });

  const communityInfo = community.community;

  useLayoutEffect(() => {
    if (session && session.user && (session.user as any)['id']) {
      const joinedCommunities = session?.user ? (session.user as any)["joinedCommunities"] : [];

      const alreadyJoined = joinedCommunities?.some((listSavedById: string) => listSavedById === community.community.id) ?? false;

      initiallyBooleanValues.current = {
        joined: alreadyJoined,
        commented: false,
      };
    }
  }, [session]);

  const navigateToCommunity = () => {
    setNavigateCommunity(community);
    router.push(`communities/${communityInfo.id}`);
  };

  return (
    <>
      <div
        className={`
          flex flex-col relative justify-between space-x-3 border-y border-gray-100 p-5 
          hover:shadow-lg dark:border-gray-800 dark:hover:bg-[#000000] rounded-full 
          p-2 hover:shadow-lg dark:border-gray-800 dark:hover:bg-[#0e1517] rounded-full
          w-full       /* Full width on mobile */
          md:w-[20vw] 
          lg:w-[48%]
          3xl:w-[30%]
          h-[6em]
          cursor-pointer
        `}
        onClick={navigateToCommunity}
      >
        <div className="absolute m-0 inset-0"></div>
        <div className="flex flex-col justify-between h-full space-x-3 cursor-pointer">
          <div className="flex item-center justify-between space-x-1">
            <div className='flex'>
              <img
                className="h-10 w-10 rounded-full object-cover "
                src={communityInfo.avatar}
                alt={communityInfo.name}
                onClick={(e) => stopPropagationOnClick(e, navigateToCommunity)}
              />
              <p className='text-sm ml-2'>
                {communityInfo.name}
              </p>
            </div>

            {communityInfo.createdAt && (
              <TimeAgo
                className="text-xs text-gray-500 dark:text-gray-400"
                date={convertDateToDisplay(communityInfo.createdAt)}
              />
            )}
          </div>
          <TagOrLabel
            color={
              community.relationshipType === 'FOUNDER' ? 'gold'
                : community.relationshipType === 'INVITED' ? 'success'
                  : community.relationshipType === 'JOINED' ? 'primary'
                    : 'info'
            }
            size="sm"
            className='mt-[-1rem] min-w-[3rem] max-w-fit self-end'
          >
            {community.relationshipType}
          </TagOrLabel>
        </div>
      </div>
    </>
  );
}

export default CommunityItemComponent;
