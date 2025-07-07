"use client";
import { faker } from "@faker-js/faker";
import { SaveIcon } from "@heroicons/react/outline";
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

import { Comment, CommentToDisplay, ListToDisplay, User } from "../../../typings";
import {
  getPercievedNumberOfRecord,
  stopPropagationOnClick,
} from "@utils/neo4j/index";
import { SaveIcon as SaveIconFillIcon, TrashIcon } from "@heroicons/react/solid";
import { useSession } from "next-auth/react";
import agent from "@utils/common";
import { useStore } from "@stores/index";
import { LoginModal } from "../common/AuthModals";
import { convertDateToDisplay } from "@utils/neo4j/neo4j";
import MoreSection from "@components/common/MoreSection";
import { ConfirmModal } from "@components/common/Modal";

interface Props {
  listToDisplay: ListToDisplay;
  onlyDisplay?: boolean;
}

function ListItemComponent({
  listToDisplay,
  onlyDisplay
}: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const { authStore, modalStore, listFeedStore } = useStore();
  const { currentSessionUser } = authStore;
  const { closeModal, showModal } = modalStore;
  const { deleteList, loadingInitial } = listFeedStore;

  const [isAlreadySaved, setIsAlraedySaved] = useState<boolean>(false);

  const initiallyBooleanValues = useRef<{
    alreadySaved: boolean;
    commented: boolean;
  }>({
    alreadySaved: false,
    commented: false,
  });


  const listInfo = listToDisplay.list;
  const founder = listToDisplay.savedBy;

  const checkUserIsLoggedInBeforeUpdatingTweet = async (
    callback: () => Promise<void>
  ) => {
    if (session && session.user && !(session.user as any)['id']) return showModal(<LoginModal />);

    await callback();
  };

  useLayoutEffect(() => {
    //If any of the bookmarks are not undefined, that means
    if (session && session.user && (session.user as any)['id']) {
      const savedLists = session?.user ? (session.user as any)["savedLists"] : [];

      const listAlreadySaved =
        savedLists?.some((listSavedById: string) => listSavedById === listToDisplay.list.id) ?? false;

      initiallyBooleanValues.current = {
        alreadySaved: listAlreadySaved,
        commented: false,
      };
    }
  }, [session]);

  const navigateToTweetUser = (username: string) => {
    router.push(`users/${username}`);
  };

  const navigateToList = () => {
    router.push(`lists/${listInfo.id}`);
  };

  const onIsAlreadySaved = async () => {
    const beforeUpdate = isAlreadySaved;
    try {
      await checkUserIsLoggedInBeforeUpdatingTweet(async () => {
        setIsAlraedySaved(!isAlreadySaved);
        await agent.mutatePostApiClient.likePost({
          statusId: listToDisplay.list.id,
          userId: userId!,
          liked: isAlreadySaved
        });
      });
    } catch {
      setIsAlraedySaved(beforeUpdate);
    }
  };

  const userId = useMemo(() => session && session.user ? (session.user as any)['id'] : "", [session]);

  const moreOptions = useMemo(() => {
    const defaultOpts = [];

    if (listInfo.userId === currentSessionUser?.id)
      defaultOpts.push({
        title: 'Delete Your List',
        onClick: async () => {
          showModal(
            <ConfirmModal
              title="Delete this List"
              confirmButtonClassNames="bg-red-700 text-gray-100"
              onClose={() => closeModal()}
              declineButtonText="Cancel"
              confirmFunc={async () => {
                await deleteList(listInfo.userId, listInfo.id);
                closeModal();
              }}
              confirmMessage="Are you sure you want to delete this list forever?"
              confirmButtonText="Delete List"
            >
              <ListItemComponent
                listToDisplay={listToDisplay}
              />
            </ConfirmModal>
          )

        },
        Icon: TrashIcon,
      });

    return defaultOpts;
  }, [listInfo.id]);

  return (
    <>
      <div
        className={`
          flex flex-col relative justify-between space-x-3 border-y border-gray-100 
          p-5 hover:shadow-lg dark:border-gray-800 dark:hover:bg-[#000000] h-[20em] 
          hover:cursor-pointer`}
        style={{ backgroundImage: `url('${listInfo.bannerImage}')`, objectFit: 'cover' }}
        onClick={navigateToList}
      >
        <div className="absolute m-0 inset-0 bg-gradient-to-t from-gray-900/40 to-gray-900/20"></div>
        <div className="flex flex-col justify-between h-full space-x-3 cursor-pointer">
          <div className="flex item-center space-x-1">
            <img
              className="h-10 w-10 rounded-full object-cover "
              src={founder.avatar}
              alt={founder.username}
              onClick={(e) => stopPropagationOnClick(e, navigateToTweetUser)}

            />
            {userId === listInfo.listCreator && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-[#00ADED] mr-1 mt-auto mb-auto"
              >
                <path
                  fillRule="evenodd"
                  d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <p
              className={`font-bold text-gray-100 mr-1 hover:underline`}
              onClick={(e) => stopPropagationOnClick(e, navigateToTweetUser)}
            >
              {founder.username}
            </p>
            <p
              className="hidden text-sm text-gray-100 sm:inline dark:text-gray-400 hover:underline"
              onClick={(e) => stopPropagationOnClick(e, navigateToTweetUser)}
            >
              @
              {founder.username ? founder.username.replace(/\s+/g, "") : ""}
              .
            </p>
            <TimeAgo
              className="text-sm text-gray-500 dark:text-gray-400"
              date={convertDateToDisplay(listInfo.createdAt)}
            />
            {moreOptions.length ?
              (
                <MoreSection
                  moreOptions={moreOptions}
                  moreOptionClassNames="bg-red-700"
                />
              )
              : null
            }
          </div>
          <p className="pt-1 text-white text-3xl">{listInfo.name}</p>
        </div>
        {!onlyDisplay && (
          <div className="flex justify-end w-full px-1">
            <div className="flex gap-2 bg-gray-100 p-2 rounded-full z-10">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`
                  flex float-right cursor-pointer item-center ${isAlreadySaved ? "text-maydan" : "text-gray-900"
                  } hover:text-maydan
                `}
                onClick={(e) => stopPropagationOnClick(e, onIsAlreadySaved)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </motion.button>

            </div>
          </div>
        )}
      </div>

    </>
  );
}

export default ListItemComponent;
