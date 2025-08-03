"use client";
import { useRouter } from "next/navigation";
import React, {
  useMemo,
  useRef,
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

interface Props {
  communityDiscussionToDisplay: CommunityDiscussionToDisplay;
}

function CommunityDiscussionItemComponent({
  communityDiscussionToDisplay,
}: Props) {
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
  const initiallyBooleanValues = useRef<{
    joined: boolean;
  }>({
    joined: false,
  });

  const userId = useMemo(() => currentSessionUser?.id ?? '', [currentSessionUser]);
  const [submitting, setSubmitting] = useState<boolean>(false);
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
    return (communityDiscussionInfo.isPrivate && communityDiscussionToDisplay.relationshipType === RelationshipType.None)
  }, [communityDiscussionToDisplay.relationshipType])
  const hasToJoin = useMemo(() => communityDiscussionToDisplay.relationshipType === RelationshipType.None, [communityDiscussionToDisplay.relationshipType]);
  const requestedInvite = useMemo(() => communityDiscussionToDisplay.relationshipType === RelationshipType.InviteRequested, [communityDiscussionToDisplay.relationshipType]);
  const canUnJoin = useMemo(() => communityDiscussionToDisplay.relationshipType === RelationshipType.Joined || joined, [communityDiscussionToDisplay.relationshipType, joined]);
  
  console.log('communityDiscussionToDisplay:', communityDiscussionToDisplay.relationshipType)

  return (
    <>
      <div
        className={`
          flex flex-col relative justify-between space-x-3 border-y border-gray-100 
          p-5 hover:shadow-lg dark:border-gray-800 dark:hover:bg-[#0e1517] rounded-full
          w-full       /* Full width on mobile */
          md:w-[20vw] 
          lg:w-[48%]
          2xl:w-[48%]
          h-[5em]
          mb-4         /* Add some bottom margin between items */
          mx-auto      /* Center the div if it doesn't fill full width */
        `}
      >
        <div className="absolute m-0 inset-0"></div>
        <div className="flex flex-col justify-between h-full space-x-3">
          <div 
            className="flex justify-around item-center space-x-1 cursor-pointer hover:underline"
            onClick={navigateToCommunityDiscussion}
          >
            <div className='flex flex-col'>
              <h6>
                {communityDiscussionInfo.name}
              </h6>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {communityDiscussionUsers.length} Users
              </p>
            </div>
            <div className="flex space-x-2">
              {
                communityDiscussionUsers.slice(0, 3).map((user, index) => (
                  <MessagesImagePreview key={index} user={user}  index={index} />
                ))}
            </div>
          </div>
          <TagOrLabel
            color={
              communityDiscussionToDisplay.relationshipType === RelationshipType.Founder ? 'gold'
                : communityDiscussionToDisplay.relationshipType === RelationshipType.Invited ? 'success'
                  : communityDiscussionToDisplay.relationshipType === RelationshipType.Joined ? 'primary'
                    : communityDiscussionToDisplay.relationshipType === RelationshipType.InviteRequested ? 'secondary'
                      : 'neutral'
            }
            size="sm"
            className='mt-[-1rem] min-w-[3rem] max-w-fit self-end'
          >
            {requestedInvite ? 'PENDING REQUEST TO JOIN' : communityDiscussionToDisplay.relationshipType}
          </TagOrLabel>
          <TagOrLabel
            color={communityDiscussionInfo.isPrivate ? 'danger' : 'info'}
            size="sm"
            className='mt-[0.5rem] min-w-[3rem] max-w-fit self-end'
          >
            {communityDiscussionInfo.isPrivate ? 'Private' : 'Public'}
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
                  await requestToJoinPrivateCommunityDiscussion(communityDiscussionInfo.communityId, communityDiscussionInfo.id);
                }
                else if (canUnJoin) {
                  await unjoinPublicCommunityDiscussion(communityDiscussionInfo.communityId, communityDiscussionInfo.id);
                  setJoined(false);
                }
                else {
                  await joinPublicCommunityDiscussion(communityDiscussionInfo.communityId, communityDiscussionInfo.id);
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

export default CommunityDiscussionItemComponent;
