"use client";
import { UploadIcon } from "@heroicons/react/outline";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import TimeAgo from "react-timeago";
import { CommunityToDisplay, PostToDisplay, UserItemToDisplay } from "../../../typings";
import { useStore } from "@stores/index";
import { ListItemToDisplay } from "models/list";
import PostComponent from "@components/posts/Post";
import UserItemComponent from "@components/users/UserItem";
import CommunityDiscussionItemComponent from "@components/community/CommunityDiscussionItem";
import { CommunityDiscussionToDisplay } from "models/community";
import CommunityItemComponent from "@components/community/CommunityItem";
import { convertDateToDisplay } from "@utils/neo4j/neo4j";
import { TagOrLabel } from "@components/common/Titles";
import { ConfirmModal } from "@components/common/Modal";


interface Props {
  savedListItemToDisplay: ListItemToDisplay;
}

function SavedListItem({
  savedListItemToDisplay
}: Props) {
  const router = useRouter();
  const { authStore, listFeedStore, modalStore } = useStore();
  const { showModal, closeModal } = modalStore;
  const { loadingUpsert, deleteSavedListItem, loadSavedListItems, listInfoForSavedListItems } = listFeedStore;

  const navigateToRelatedEntity = () => {
    if (savedListItemToDisplay.label === "Post")
      window.open(`${process.env.NEXT_PUBLIC_BASE_URL}/status/${(savedListItemToDisplay.relatedEntity as PostToDisplay).post.id}`, "_blank");
    else if (savedListItemToDisplay.label === "User")
      window.open(`${process.env.NEXT_PUBLIC_BASE_URL}/users/${(savedListItemToDisplay.relatedEntity as UserItemToDisplay).user.username}`), "_blank";
    else if (savedListItemToDisplay.label === "Community")
      window.open(`${process.env.NEXT_PUBLIC_BASE_URL}/communities/${({ community: savedListItemToDisplay.relatedEntity } as CommunityToDisplay).community.id}`, "_blank")
    else if (savedListItemToDisplay.label === "Community Discussion") {
      const cmtyDisc = (savedListItemToDisplay.relatedEntity as CommunityDiscussionToDisplay).communityDiscussion;
      window.open(`${process.env.NEXT_PUBLIC_BASE_URL}/communities/${cmtyDisc.communityId}/${cmtyDisc.id}`, "_blank")
    }
    // ;
  };

  const RelatedEntityNode = () => {
    if (savedListItemToDisplay.label === "Post")
      return <PostComponent onlyDisplay={true} postToDisplay={savedListItemToDisplay.relatedEntity as PostToDisplay} />;
    else if (savedListItemToDisplay.label === "User")
      return <UserItemComponent
        userItemToDisplay={savedListItemToDisplay.relatedEntity as UserItemToDisplay}
        usersAlreadyFollowedOrAddedIds={[]}
        loggedInUserId={authStore.currentSessionUser?.id ?? ''}
        canAddOrFollow={false}
        onModal={true}
        justDisplay={true}
      />;
    else if (savedListItemToDisplay.label === "Community")
      return <CommunityItemComponent
        community={{ community: savedListItemToDisplay.relatedEntity } as CommunityToDisplay}
      />;
    else if (savedListItemToDisplay.label === "Community Discussion")
      return <CommunityDiscussionItemComponent
        communityDiscussionToDisplay={savedListItemToDisplay.relatedEntity as CommunityDiscussionToDisplay}
      />;

    else
      return <div>{JSON.stringify(savedListItemToDisplay.relatedEntity)}</div>
  }

  const labelColor = useMemo(() => {
    if (savedListItemToDisplay.label === "Post") return "postGradient";
    else if (savedListItemToDisplay.label === "User") return "userGradient";
    else if (savedListItemToDisplay.label === "Community") return "communityGradient";
    else if (savedListItemToDisplay.label === "Community Discussion") return "communityDiscussionGradient";
    else if (savedListItemToDisplay.label === "Community Discussion Message") return "communityDiscussionMessageGradient";
    return "defaultSavedItemGradient";
  }, [savedListItemToDisplay]);

  return (
    <div
      className="relative flex flex-col space-x-3 border-y border-gray-100 p-5 hover:shadow-lg dark:border-gray-800 dark:hover:bg-[#000000]"
    >
      <div className='flex justify-between'>
        <div className='absolute top-0 left-0 text-sm text-gray-500 dark:text-gray-400'>
          Saved{" "}
          <TimeAgo

            className="text-sm text-gray-500 dark:text-gray-400"
            date={convertDateToDisplay(savedListItemToDisplay.listItem.savedAt)}
          />
        </div>

        <TagOrLabel
          color={labelColor}
          size="md"
          className="absolute top-0 right-0"
        >
          {savedListItemToDisplay.label}
        </TagOrLabel>
      </div>
      <div className='relative'>
        {RelatedEntityNode()}
        <div className='absolute top-0 bg-transparent w-full h-full z-10' onClick={navigateToRelatedEntity} />
      </div>

      <button
        type='button'
        disabled={loadingUpsert}
        className={`rounded-full bg-maydan px-5 py-2 font-bold text-white disabled:opacity-40 w-48 self-center`}
        onClick={(e) => {
          e.preventDefault();
          showModal(
            <ConfirmModal
              title="Are you sure?"
              confirmMessage=""
              confirmButtonClassNames="bg-red-700"
              confirmFunc={async () => {
                await deleteSavedListItem(authStore.currentSessionUser?.id!, savedListItemToDisplay.listItem?.listId!, savedListItemToDisplay.listItem?.id);
                closeModal();
                await loadSavedListItems(authStore.currentSessionUser?.id!, listInfoForSavedListItems.id!)
              }}
              declineButtonText="Cancel"
              confirmButtonText="Remove"
              onClose={() => closeModal()}
            >
              {RelatedEntityNode()}
              <p className='my-2'>{`Are you sure you want to remove this from your list named ${listInfoForSavedListItems.name}?`}</p>
            </ConfirmModal>
          );
        }}
      >
        {loadingUpsert ? (
          <svg
            aria-hidden="true"
            className="inline w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-maydan"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        ) : (
          'Remove'
        )}
      </button>
    </div>
  );
}

export default SavedListItem;
