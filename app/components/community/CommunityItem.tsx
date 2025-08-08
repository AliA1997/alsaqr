"use client";
import { useRouter } from "next/navigation";
import React, {
  Suspense,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import TimeAgo from "react-timeago";

import { RelationshipType, type CommunityToDisplay } from "../../../typings.d";
import {
  stopPropagationOnClick,
} from "@utils/neo4j/index";
import { useStore } from "@stores/index";
import { convertDateToDisplay } from "@utils/neo4j/neo4j";
import { TagOrLabel } from "@components/common/Titles";
import { ButtonLoader } from "@components/common/CustomLoader";
import { PlusCircleIcon } from "@heroicons/react/outline";
import { OptimizedImage } from "@components/common/Image";
import { InfoButton } from "@components/common/Buttons";

interface Props {
  community: CommunityToDisplay;
}

function CommunityItemComponent({
  community
}: Props) {
  const router = useRouter();
  const { authStore, communityFeedStore } = useStore();
  const { currentSessionUser } = authStore;
  const {
    setNavigateCommunity,
    loadingJoinCommunity,
    joinPublicCommunity,
    unjoinPublicCommunity,
    requestToJoinPrivateCommunity,
  } = communityFeedStore;

  const initiallyBooleanValues = useRef<{
    joined: boolean;
  }>({
    joined: false,
  });

  const communityInfo = community.community;
  const userId = useMemo(() => currentSessionUser?.id ?? '', [currentSessionUser]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [currentRelationshipType, setCurrentRelationshipType] = useState<RelationshipType>(community.relationshipType)
  const [joined, setJoined] = useState<boolean>(false);

  const navigateToCommunity = () => {
    setNavigateCommunity(community);
    router.push(`communities/${communityInfo.id}`);
  };

  const hasToRequestPermissionToJoin = useMemo(() => {
    return (community.community.isPrivate && currentRelationshipType === RelationshipType.None)
  }, [community.relationshipType, currentRelationshipType])

  const hasToJoin = useMemo(() => currentRelationshipType === RelationshipType.None, [community.relationshipType, currentRelationshipType]);
  const requestedInvite = useMemo(() => currentRelationshipType === RelationshipType.InviteRequested, [community.relationshipType, currentRelationshipType]);
  const canUnJoin = useMemo(() => currentRelationshipType === RelationshipType.Joined || joined, [community.relationshipType, currentRelationshipType, joined]);

  console.log('community:', community.relationshipType)
  return (
    <>
      <div
        className={`
          flex flex-col relative justify-between space-x-3 border-y border-gray-100 p-5 
          hover:shadow-lg dark:border-gray-800 dark:hover:bg-[#000000] rounded-full 
          p-2 hover:shadow-lg dark:border-gray-800 dark:hover:bg-[#0e1517] rounded-full
          w-full       /* Full width on mobile */
          md:w-[23vw] 
          lg:w-[49%]
          3xl:w-[30%]
          h-[7.5rem]
        `}
      >
        <div className="flex flex-col justify-between h-full space-x-3">
          <div className="flex item-center justify-between space-x-1">
            <div className='flex  hover:underline cursor-pointer' onClick={(e) => stopPropagationOnClick(e, navigateToCommunity)}>
              <OptimizedImage
                src={communityInfo.avatar}
                alt={communityInfo.name}
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
              currentRelationshipType === RelationshipType.Founder ? 'gold'
                : currentRelationshipType === RelationshipType.Invited ? 'success'
                  : currentRelationshipType === RelationshipType.Joined ? 'primary'
                    : currentRelationshipType === RelationshipType.InviteRequested ? 'secondary'
                      : 'neutral'
            }
            size="sm"
            className='mt-[-1rem] min-w-[3rem] max-w-fit self-end'
          >
            {requestedInvite ? 'PENDING REQUEST TO JOIN' : currentRelationshipType}
          </TagOrLabel>
          <TagOrLabel
            color={community.community.isPrivate ? 'danger' : 'info'}
            size="sm"
            className='mt-[0.5rem] min-w-[3rem] max-w-fit self-end'
          >
            {community.community.isPrivate ? 'Private' : 'Public'}
          </TagOrLabel>
        </div>
        {(hasToJoin || canUnJoin) && (
          <div className="flex absolute top-[4.5rem] left-[4rem] justify-center h-full space-x-3 z-[100]">
            <InfoButton
              disabled={submitting}
              onClick={async (e: any) => {
                e.stopPropagation();
                setSubmitting(true);
                if (hasToRequestPermissionToJoin) {
                  await requestToJoinPrivateCommunity(community.community.id);
                  setCurrentRelationshipType(RelationshipType.InviteRequested);
                }
                else if (canUnJoin) {
                  await unjoinPublicCommunity(community.community.id);
                  setCurrentRelationshipType(RelationshipType.None);
                  setJoined(false);
                }
                else {
                  await joinPublicCommunity(community.community.id);
                  setCurrentRelationshipType(RelationshipType.Joined);
                  setJoined(true);
                }
                setSubmitting(false);
              }}
              classNames="px-0 cursor-default"
            >
              {submitting ? (
                <ButtonLoader />
              ) : (
                <p className={`
                  flex
                  min-w-[4rem] max-w-[12rem] cursor-pointer hover:underline ${canUnJoin ? 'hover:text-red-400' : 'hover:text-maydan'}
                `}>
                  <span className={`mt-1 text-inherit`}>
                    {canUnJoin ? 'Leave' : hasToRequestPermissionToJoin ? 'Request to Join' : 'Join'}
                  </span>
                  {!canUnJoin && <PlusCircleIcon className="ml-0 h-[1.5rem] w-[1.5rem] py-1" />}
                </p>
              )}
            </InfoButton>
          </div>
        )}
      </div>
    </>
  );
}

export default CommunityItemComponent;
