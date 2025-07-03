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

import { Comment, CommentToDisplay, CommunityToDisplay, ListToDisplay, User } from "../../../typings";
import {
  getPercievedNumberOfRecord,
  stopPropagationOnClick,
} from "@utils/neo4j/index";
import { SaveIcon as SaveIconFillIcon } from "@heroicons/react/solid";
import { useSession } from "next-auth/react";
import { useStore } from "@stores/index";
import { LoginModal } from "../common/AuthModals";
import { convertDateToDisplay } from "@utils/neo4j/neo4j";
import { CommunityDiscussionToDisplay } from "models/community";
import { MessagesImagePreview } from "@components/common/Containers";

interface Props {
  communityDiscussionToDisplay: CommunityDiscussionToDisplay;
}

function CommunityDiscussionItemComponent({
  communityDiscussionToDisplay,
}: Props) {
  const router = useRouter();
  const { data: session } = useSession();

  const { modalStore } = useStore();
  const { showModal } = modalStore;

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

  const communityDiscussionInfo = communityDiscussionToDisplay.communityDiscussion;

  const communityDiscussionUsers = useMemo(() => {
    const iUsers = communityDiscussionToDisplay.invitedUsers ?? [];
    const jUsers = communityDiscussionToDisplay.joinedUsers ?? [];
    return [...iUsers, ...jUsers];
  }, [
    communityDiscussionToDisplay.invitedUsers,
    communityDiscussionToDisplay.joinedUsers
  ]);
//   const founder = community.founder;
  // const refreshComments = async () => {
  //   const comments: Comment[] = await fetchComments(communityInfo.id);
  //   setCurrentComments(comments);
  // };
  const checkUserIsLoggedInBeforeUpdatingTweet = async (
    callback: () => Promise<void>
  ) => {
    if (session && session.user && !(session.user as any)['id']) return showModal(<LoginModal />)

    await callback();
  };

//   useLayoutEffect(() => {
//     if (session && session.user && (session.user as any)['id']) {
//       const joinedCommunities = session?.user ? (session.user as any)["joinedCommunities"] : [];

//       const alreadyJoined = joinedCommunities?.some((listSavedById: string) => listSavedById === community.community.id) ?? false;

//       initiallyBooleanValues.current = {
//         joined: alreadyJoined,
//         commented: false,
//       };
//     }
//   }, [session]);

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
  const navigateToCommunityDiscussion = () => {
    router.push(`/communities/${communityDiscussionInfo.communityId}/${communityDiscussionInfo.id}`);
  };

//   const onIsAlreadyJoined = async () => {
//     const beforeUpdate = isJoined;
//     try {
//       await checkUserIsLoggedInBeforeUpdatingTweet(async () => {
//         setIsJoined(!isJoined);
//         await joinCommunity(community.community.id, userId!, isJoined);
//       });
//     } catch {
//       setIsJoined(beforeUpdate);
//     }
//   };


  const commentOnTweet = () => { };

  const userId = useMemo(() => session && session.user ? (session.user as any)['id'] : "", [session]);
  console.log('JSON.stringify(communityDiscussionInfo)', JSON.stringify(communityDiscussionInfo))
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
                  <MessagesImagePreview user={user}  index={index} />
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
