"use client";
import { useRouter } from "next/navigation";
import React, {
  useMemo,
  useState,
} from "react";
import { useStore } from "@stores/index";
import { CommunityDiscussionToDisplay } from "models/community";
import { MessagesImagePreview } from "@components/common/Containers";
import { TagOrLabel } from "@components/common/Titles";
import { RelationshipType } from "typings.d";
import { InfoButton } from "@components/common/Buttons";
import { ButtonLoader } from "@components/common/CustomLoader";
import { PlusCircleIcon } from "@heroicons/react/solid";
import { observer } from "mobx-react-lite";
import { stopPropagationOnClick } from "@utils/neo4j";

interface Props {
  communityDiscussionToDisplay: CommunityDiscussionToDisplay;
}

const CommunityDiscussionItemComponent = observer(({
  communityDiscussionToDisplay,
}: Props) => {
  const router = useRouter();

  const { authStore, modalStore, communityDiscussionFeedStore } = useStore();
  const { currentSessionUser } = authStore;
  const { showModal } = modalStore;
  const {
    joinPublicCommunityDiscussion,
    unjoinPublicCommunityDiscussion,
    requestToJoinPrivateCommunityDiscussion,
  } = communityDiscussionFeedStore;

  const communityDiscussionInfo = communityDiscussionToDisplay.communityDiscussion;

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [currentRelationshipType, setCurrentRelationshipType] = useState<RelationshipType>(communityDiscussionToDisplay.relationshipType)
  const [joined, setJoined] = useState<boolean>(false);

  const communityDiscussionUsers = useMemo(() => {
    const iUsers = communityDiscussionToDisplay.invitedUsers ?? [];
    const jUsers = communityDiscussionToDisplay.joinedUsers ?? [];
    return [...iUsers, ...jUsers];
  }, [
    communityDiscussionToDisplay.invitedUsers,
    communityDiscussionToDisplay.joinedUsers
  ]);

  const navigateToCommunityDiscussion = () => {
    router.push(`/communities/${communityDiscussionInfo.communityId}/${communityDiscussionInfo.id}`);
  };

  const hasToRequestPermissionToJoin = useMemo(() => {
    return (communityDiscussionInfo.isPrivate && currentRelationshipType === RelationshipType.None)
  }, [currentRelationshipType, communityDiscussionToDisplay.relationshipType])
  const hasToJoin = useMemo(() => currentRelationshipType === RelationshipType.None, [currentRelationshipType, communityDiscussionToDisplay.relationshipType]);
  const requestedInvite = useMemo(() => currentRelationshipType === RelationshipType.InviteRequested, [currentRelationshipType, communityDiscussionToDisplay.relationshipType]);
  const canUnJoin = useMemo(() => currentRelationshipType === RelationshipType.Joined || joined, [currentRelationshipType, communityDiscussionToDisplay.relationshipType, joined]);

  console.log('communityDiscussionToDisplay:', currentRelationshipType)

  return (
    <>
      <div
        className={`
          flex flex-col relative justify-around space-x-3 border-y border-gray-100 
          p-5 hover:shadow-lg dark:border-gray-800 dark:hover:bg-[#0e1517] rounded-full
          w-full       /* Full width on mobile */
          md:w-[21rem] 
          lg:w-[49%]
          3xl:w-[30%]
          h-[10rem]
          mb-4         /* Add some bottom margin between items */
        `}
      >
        <div className="flex flex-col justify-start h-full space-x-3 p-1">
          <div
            className="flex justify-around item-center space-x-1 cursor-pointer hover:underline"
            onClick={(e) => stopPropagationOnClick(e, navigateToCommunityDiscussion)}
          >
            <div className='flex flex-col'>
              <h6 className='text-sm'>
                {communityDiscussionInfo.name}
              </h6>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {communityDiscussionUsers.length} Users
              </p>
            </div>
            <div className="flex space-x-2">
              {
                communityDiscussionUsers.slice(0, 3).map((user, index) => (
                  <MessagesImagePreview key={index} user={user} index={index} />
                ))}
            </div>
          </div>

          <div className='flex justify-start'>
            <TagOrLabel
              color={
                currentRelationshipType === RelationshipType.Founder ? 'gold'
                  : currentRelationshipType === RelationshipType.Invited ? 'success'
                    : currentRelationshipType === RelationshipType.Joined ? 'primary'
                      : currentRelationshipType === RelationshipType.InviteRequested ? 'secondary'
                        : 'neutral'
              }
              size="sm"
              className='w-full max-w-fit self-end self-[unset]'
            >
              {requestedInvite ? 'PENDING REQUEST TO JOIN' : currentRelationshipType}
            </TagOrLabel>
            <TagOrLabel
              color={communityDiscussionInfo.isPrivate ? 'danger' : 'info'}
              size="sm"
              className='mt-[0.5rem] w-full max-w-fit self-[unset]'
            >
              {communityDiscussionInfo.isPrivate ? 'Private' : 'Public'}
            </TagOrLabel>
          </div>

          {(hasToJoin || canUnJoin) && (
            <div className="flex justify-center h-full space-x-3 z-[10]">
              <InfoButton
                disabled={submitting}
                onClick={async (e: any) => {
                  e.stopPropagation();
                  setSubmitting(true);
                  if (hasToRequestPermissionToJoin) {
                    await requestToJoinPrivateCommunityDiscussion(communityDiscussionInfo.communityId, communityDiscussionInfo.id);
                    setCurrentRelationshipType(RelationshipType.InviteRequested);
                  }
                  else if (canUnJoin) {
                    await unjoinPublicCommunityDiscussion(communityDiscussionInfo.communityId, communityDiscussionInfo.id);
                    setCurrentRelationshipType(RelationshipType.None);
                    setJoined(false);
                  }
                  else {
                    await joinPublicCommunityDiscussion(communityDiscussionInfo.communityId, communityDiscussionInfo.id);
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
                  flex font-[1rem]
                  min-w-[4rem] max-w-[15rem] cursor-pointer hover:underline ${canUnJoin ? 'hover:text-red-400' : 'hover:text-maydan'}
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

      </div>
    </>
  );
});

export default CommunityDiscussionItemComponent