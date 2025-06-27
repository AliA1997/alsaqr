"use client";
import {UploadIcon } from "@heroicons/react/outline";
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
import { CommentToDisplay, PostToDisplay, User } from "../../typings";
import {
  getPercievedNumberOfRecord,
  stopPropagationOnClick,
} from "@utils/neo4j/index";
import { useSession } from "next-auth/react";
import { useStore } from "@stores/index";
import { LoginModal } from "./common/AuthModals";

interface Props {
  id: string;
  username: string;
  textOrName: string;
  image: string | undefined;
  userAvatar: string;
  dateCreated: string;
  type: string;
  saved: boolean;
}

function SavedListItem({
    id, 
  username,
  userAvatar,
  textOrName,
  image,
  dateCreated,
  type,
  saved
}: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const { modalStore } = useStore();
  const { showModal } = modalStore;
  const [isSavedBool, setIsSavedBool] = useState<boolean>(false);

  const initiallyBooleanValues = useRef<{
    isSaved: boolean;
  }>({
    isSaved: false
  });

  const checkUserIsLoggedInBeforeUpdatingTweet = async (
    callback: () => Promise<void>
  ) => {
    if (session && session.user && !(session.user as any)['id']) return showModal(<LoginModal />)

    await callback();
  };

  useLayoutEffect(() => {
    //If any of the bookmarks are not undefined, that means
    if (session && session.user && (session.user as any)['id']) {
      
      initiallyBooleanValues.current = {
        isSaved: saved
      };
      setIsSavedBool(saved);
    }
  }, [session]);
  const navigateToTweetUser = () => {
    router.push(`users/${username}`);
  };

  const navigateToRelatedEntity = () => {
    // router.push(`status/${postInfo.id}`);
  };
  const userId = useMemo(() => session && session.user ? (session.user as any)['id'] : "", [session]);

  return (
    <div
      className="flex flex-col space-x-3 border-y border-gray-100 p-5 hover:shadow-lg dark:border-gray-800 dark:hover:bg-[#000000]"
      onClick={navigateToRelatedEntity}
    >
      <div className="flex space-x-3 cursor-pointer">
        <img
          className="h-10 w-10 rounded-full object-cover "
          src={userAvatar}
          alt={username}
          onClick={(e) => stopPropagationOnClick(e, navigateToTweetUser)}
        />
        <div>
          <div className="flex item-center space-x-1">
            <p
              className={`font-bold mr-1 hover:underline`}
              onClick={(e) => stopPropagationOnClick(e, navigateToTweetUser)}
            >
              {username}
            </p>
            {userId === username && (
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
              className="hidden text-sm text-gray-500 sm:inline dark:text-gray-400 hover:underline"
              onClick={(e) => stopPropagationOnClick(e, navigateToTweetUser)}
            >
              @
              {username ? username.replace(/\s+/g, "") : ""}
              .
            </p>
            <TimeAgo
              className="text-sm text-gray-500 dark:text-gray-400"
              date={dateCreated}
            />
          </div>
          <p className="pt-1">{textOrName}</p>
          {image && (
                <img
                    src={image}
                    alt="img/tweet"
                    className="m-5 ml-0 max-h-60
                            rounded-lg object-cover shadow-sm"
                />
          )}
        </div>
      </div>
      <div className="mt-5 flex justify-between">


          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex cursor-pointer item-center space-x-3 text-gray-400"
          >
            <UploadIcon className="h-5 w-5" />
          </motion.div>
        </div>
    </div>
  );
}

export default SavedListItem;
