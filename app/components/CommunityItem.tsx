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

import { Comment, CommentToDisplay, CommunityToDisplay, ListToDisplay, User } from "../../typings";
import {
  getPercievedNumberOfRecord,
  stopPropagationOnClick,
} from "@utils/neo4j/index";
import { SaveIcon as SaveIconFillIcon } from "@heroicons/react/solid";
import { useSession } from "next-auth/react";
import { joinCommunity } from "@utils/communities/joinCommunity";
import { useStore } from "@stores/index";

interface Props {
  community: CommunityToDisplay;
}

function CommunityItemComponent({
  community,
}: Props) {
  const router = useRouter();
  const { data: session } = useSession();

  const { modalStore } = useStore();
  const { toggleLoginModal } = modalStore;

  const [currentComments, setCurrentComments] = useState<CommentToDisplay[]>(() => {
    const comments = session && session.user ? (session.user as any).comments : [];
    return comments ?? []
  });

  const [input, setInput] = useState<string>("");
  const [commentBoxOpen, setCommentBoxOpen] = useState<boolean>(false);
  const [isJoined, setIsJoined] = useState<boolean>(false);

  const initiallyBooleanValues = useRef<{
    joined: boolean;
    commented: boolean;
  }>({
    joined: false,
    commented: false,
  });

  // const numberOfJoinedUsers = useMemo(
  //   () =>
  //     getPercievedNumberOfRecord<User>(
  //       isJoined,
  //       initiallyBooleanValues.current?.joined,
  //       community.users ?? []
  //     ),
  //   []
  // );
  const numberOfComments = useMemo(() => {
    const userId = session && session.user && (session.user as any).id
    return currentComments.some((comm: CommentToDisplay) => comm.userId === userId)
      ? currentComments.length + 1
      : currentComments.length;
  }, [currentComments, session]);

  const communityInfo = community.community;
  const founder = community.founder;
  // const refreshComments = async () => {
  //   const comments: Comment[] = await fetchComments(communityInfo.id);
  //   setCurrentComments(comments);
  // };
  const checkUserIsLoggedInBeforeUpdatingTweet = async (
    callback: () => Promise<void>
  ) => {
    if (session && session.user && !(session.user as any)['id']) return toggleLoginModal(true);

    await callback();
  };

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

  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    e.preventDefault();

    const commentToast = toast.loading("Posting Comment...");

    toast.success("Comment Posted!", {
      id: commentToast,
    });

    setInput("");
    setCommentBoxOpen(false);
    // refreshComments();
  };

  const navigateToTweetUser = () => {
    router.push(`users/${communityInfo.userId}`);
  };

  const navigateToCommunity = () => {
    router.push(`status/${communityInfo.id}`);
  };

  const onIsAlreadySaved = async () => {
    const beforeUpdate = isJoined;
    try {
      await checkUserIsLoggedInBeforeUpdatingTweet(async () => {
        setIsJoined(!isJoined);
        await joinCommunity(community.community.id, userId!, isJoined);
      });
    } catch {
      setIsJoined(beforeUpdate);
    }
  };


  const commentOnTweet = () => { };

  const userId = useMemo(() => session && session.user ? (session.user as any)['id'] : "", [session]);

  return (
    <>
      <div
        className="flex flex-col relative justify-between space-x-3 border-y border-gray-100 p-5 hover:shadow-lg dark:border-gray-800 dark:hover:bg-[#000000] h-[20em]"
        style={{ backgroundImage: `url('${communityInfo.bannerImage}') no-repeat`, objectFit: 'cover' }}
        onClick={navigateToCommunity}
      >
        <div className="absolute m-0 inset-0 bg-gradient-to-t from-gray-900/80 to-gray-900/20"></div>
        <div className="flex flex-col justify-between h-full space-x-3 cursor-pointer">
          <div className="flex item-center space-x-1">
            <img
              className="h-10 w-10 rounded-full object-cover "
              src={founder.avatar}
              alt={founder.username}
              onClick={(e) => stopPropagationOnClick(e, navigateToTweetUser)}
            />
            {userId === founder.username && (
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
              date={communityInfo.createdAt}
            />
          </div>
          <p className="pt-1 text-white text-3xl">{communityInfo.name}</p>
        </div>
        <div className="flex justify-between w-full p-5">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) =>
              stopPropagationOnClick(e, () => {
                toggleLoginModal(true);
                setCommentBoxOpen(!commentBoxOpen);
              })
            }
            className="flex bg-gray-100 p-2 rounded-full cursor-pointer item-center space-x-3 text-gray-400 hover:text-maydan"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
              />
            </svg>

            <p className="text-center">{numberOfComments}</p>
          </motion.div>

          {/* <div className="flex gap-2 bg-gray-100 p-2 rounded-full">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`
                flex cursor-pointer item-center space-x-3 ${isAlreadySaved ? "text-maydan" : "text-gray-400"
                } hover:text-maydan 
              `}
              onClick={(e) => stopPropagationOnClick(e, onIsAlreadySaved)}
            >
              {isAlreadySaved ? (
                <SaveIconFillIcon className="h-5 w-5" />
              ) : (
                <SaveIcon className="h-5 w-5" />
              )}
            </motion.div>

          </div> */}
        </div>
        {commentBoxOpen && (
          <>
            {userId && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <form className="mt-3 flex space-x-3">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 rounded-lg bg-gray-100 p-2 outline-none dark:bg-gray-700"
                    type="text"
                    placeholder="Write a comment..."
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!input}
                    type="submit"
                    className="text-maydan  disabled:text-gray-200 cursor-pointer"
                  >
                    Post
                  </button>
                </form>
              </motion.div>
            )}
          </>
        )}
        {commentBoxOpen && (
          <>
            {currentComments?.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="my-2 mt-5 max-h-44 space-y-5 overflow-y-scroll border-t border-gray-100 p-5 scrollbar-thin scrollbar-thumb-blue-100"
              >
                {currentComments.map((comment) => (
                  <div key={comment.id} className="flex space-x-2">
                    <hr className="top-10 h-8 border-x border-maydan/30" />
                    <img
                      src={comment.profileImg}
                      className="mt-2 h-7 w-7 rounded-full object-cover"
                      alt=""
                    />
                    <div>
                      <div className="flex items-center space-x-l">
                        <p className="mr-1 font-bold">{comment.username}</p>
                        <p className="hidden text-sm text-gray-500 lg:inline">
                          @{comment.username.replace(/\s+/g, "")}.
                        </p>
                        <TimeAgo
                          className="text-sm text-gray-500"
                          date={comment.createdAt}
                        />
                      </div>
                      <p>{comment.text}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>

    </>
  );
}

export default CommunityItemComponent;
