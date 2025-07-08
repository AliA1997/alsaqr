"use client";
import { useRouter } from "next/navigation";
import React, {
  useMemo,
} from "react";
import { useStore } from "@stores/index";
import { CommunityDiscussionToDisplay } from "models/community";
import { MessagesImagePreview } from "@components/common/Containers";

interface Props {
  communityDiscussionToDisplay: CommunityDiscussionToDisplay;
}

function CommunityDiscussionItemComponent({
  communityDiscussionToDisplay,
}: Props) {
  const router = useRouter();

  const { modalStore } = useStore();
  const { showModal } = modalStore;

  const communityDiscussionInfo = communityDiscussionToDisplay.communityDiscussion;

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
          h-[5em] cursor-pointer
          mb-4         /* Add some bottom margin between items */
          mx-auto      /* Center the div if it doesn't fill full width */
        `}
        onClick={navigateToCommunityDiscussion}
      >
        <div className="absolute m-0 inset-0"></div>
        <div className="flex flex-col justify-between h-full space-x-3 cursor-pointer">
          <div className="flex justify-around item-center space-x-1">
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
          {/* {communityDiscussionInfo.createdAt && (
            <TimeAgo
              className="text-sm text-gray-500 dark:text-gray-400"
              date={convertDateToDisplay(communityDiscussionInfo.createdAt)}
            />
          )} */}
        </div>
      </div>
    </>
  );
}

export default CommunityDiscussionItemComponent;
