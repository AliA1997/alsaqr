"use client";
import { PlusCircleIcon, UploadIcon, XIcon } from "@heroicons/react/outline";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// import dynamic from 'next/dynamic';
import toast from "react-hot-toast";
import TimeAgo from "react-timeago";

// import { auth } from "../firebase/firebase";
import type { CommentForm, CommentToDisplay, PostToDisplay, User } from "../../../typings";
import {
  getPercievedNumberOfRecord,
  stopPropagationOnClick,
} from "@utils/neo4j/index";
// import { likeTweet } from "@utils/update-tweets/likeTweet";
// import { retweet } from "@utils/update-tweets/retweet";
import { useSession } from "next-auth/react";
import { FilterKeys, useStore } from "@stores/index";
import { LoginModal } from "../common/AuthModals";
import { convertDateToDisplay } from "@utils/neo4j/neo4j";
import { AddOrFollowButton, BookmarkedIconButton, CommentIconButton, LikesIconButton, MoreButton, RePostedIconButton } from "../common/IconButtons";

import { faker } from "@faker-js/faker";
import UpsertBoxIconButton from "@components/common/UpsertBoxIconButtons";
import { ModalLoader } from "@components/common/CustomLoader";
import NextImage from 'next/image';
import { TrashIcon } from "@heroicons/react/solid";
import MoreSection from "@components/common/MoreSection";
import { ConfirmModal } from "@components/common/Modal";
import { SaveToListModal } from "@components/list/ListModal";
import { ROUTES_USER_CANT_ACCESS } from "@utils/constants";

interface Props {
  postToDisplay: PostToDisplay;
  filterKey?: FilterKeys;
  canAdd?: boolean;
  onAdd?: (pst: PostToDisplay) => void;
  postsAlreadyAddedByIds?: string[];
  onlyDisplay?: boolean;
}

function PostComponent({
  postToDisplay,
  filterKey,
  canAdd,
  onAdd,
  postsAlreadyAddedByIds,
  onlyDisplay
}: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const { authStore, feedStore, listFeedStore, modalStore } = useStore();
  const { currentSessionUser } = authStore;
  const { showModal, closeModal } = modalStore;
  const { 
    rePost, 
    likedPost, 
    bookmarkPost, 
    loadComments, 
    comments, 
    posts, 
    addComment, 
    loadingComments,
    loadingUpsert,
    deleteYourPost
  } = feedStore;

  const [currentComments, setCurrentComments] = useState<CommentToDisplay[]>(() => {
    const comments = session && session.user ? (session.user as any).comments : [];
    return comments ?? []
  });

  const [input, setInput] = useState<string>("");
  const [image, setImage] = useState<string>("");

  const [commentBoxOpen, setCommentBoxOpen] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isRePosted, setIsRePosted] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  const initiallyBooleanValues = useRef<{
    retweeted: boolean;
    liked: boolean;
    commented: boolean;
  }>({
    retweeted: false,
    liked: false,
    commented: false,
  });

  const numberOfRetweets = useMemo(
    () =>
      getPercievedNumberOfRecord<User>(
        isRePosted,
        initiallyBooleanValues.current?.retweeted,
        postToDisplay.reposters ?? []
      ),
    [isRePosted]
  );
  const numberOfLikes = useMemo(
    () =>
      getPercievedNumberOfRecord<User>(
        isLiked,
        initiallyBooleanValues.current?.liked,
        postToDisplay.likers ?? []
      ),
    [isLiked]
  );
  const numberOfComments = useMemo(() => {
    const username = session && session.user && (session.user as any).username
    return currentComments.some((comm: CommentToDisplay) => comm.username === username)
      ? currentComments.length + 1
      : currentComments.length;
  }, [currentComments, session]);
  // const isBookmarkedRef = useRef<boolean>(bookmarks?.some(bk => bk === tweet.tweet.id) ?? false);

  const postInfo = postToDisplay.post;
  const refreshComments = async () => {
    loadComments(postInfo.id)
      .then((lCmts: CommentToDisplay[]) => {
        setCurrentComments(lCmts);
      })
      .catch((err: any) => {
        console.log("Error fetching comments:", JSON.stringify(err));
      });
  };
  const checkUserIsLoggedInBeforeUpdatingTweet = async (
    callback: () => Promise<void>
  ) => {
    if (session && session.user && !(session.user as any)['id']) return showModal(<LoginModal />);

    await callback();
  };

  useLayoutEffect(() => {
    //If any of the bookmarks are not undefined, that means
    if (session && session.user && (session.user as any)['id']) {
      const likedPosts = session?.user ? (session.user as any)["likedPosts"] : [];
      const reposts = session?.user ? (session.user as any)["reposts"] : [];
      const twtAlreadyLiked =
        likedPosts?.some((likedPost: string) => likedPost === postInfo.id) ??
        false;

      const twtAlreadyRetweeted =
        reposts?.some((repost: string) => repost === postInfo.id) ?? false;

      const twtAlreadyBookmarked =
        (session.user as any).bookmarks?.some((bk: string) => bk === postInfo.id) ?? false;

      if (postsAlreadyAddedByIds)
        setIsAdded(postsAlreadyAddedByIds.some(pstId => pstId === postInfo.id));

      initiallyBooleanValues.current = {
        liked: twtAlreadyLiked,
        retweeted: twtAlreadyRetweeted,
        commented: false,
      };
      setIsBookmarked(twtAlreadyBookmarked);
      setIsRePosted(twtAlreadyRetweeted);
      setIsLiked(twtAlreadyLiked);
    }
  }, [session]);

  const handleSubmit = async () => {

    const commentToast = toast.loading("Posting Comment...");

    const newComment: CommentForm = {
      id: `comment_${faker.datatype.uuid()}`,
      postId: postInfo.id,
      userId: postInfo.userId!,
      text: input,
      image: image,
    }

    toast.success("Comment Posted!", {
      id: commentToast,
    });

    await addComment(newComment);
    setInput("");
    setImage("");
    setCommentBoxOpen(false);
    refreshComments();
  };

  const navigateToTweetUser = () => {
    router.push(`users/${postToDisplay.username}`);
  };

  const navigateToTweet = () => {
    router.push(`status/${postInfo.id}`);
  };

  const onLikeTweet = async () => {
    const beforeUpdate = isLiked;
    try {
      await checkUserIsLoggedInBeforeUpdatingTweet(async () => {
        setIsLiked(!isLiked);
        await likedPost({
          statusId: postInfo.id,
          userId: userId!,
          liked: isLiked
        });
      });
    } catch {
      setIsLiked(beforeUpdate);
    }
  };

  const onRetweet = async () => {
    const beforeUpdate = isRePosted;
    try {
      await checkUserIsLoggedInBeforeUpdatingTweet(async () => {
        setIsRePosted(!isRePosted);

        await rePost({
          statusId: postInfo.id,
          userId: userId!,
          reposted: isRePosted
        });
      });
    } catch {
      setIsRePosted(beforeUpdate);
    }
  };

  const commentOnTweet = () => { };

  const onBookmarkTweet = async () => {
    const beforeUpdate = isBookmarked;
    try {
      await checkUserIsLoggedInBeforeUpdatingTweet(async () => {
        setIsBookmarked(!isBookmarked);
        await bookmarkPost({
          statusId: postInfo.id,
          userId: userId!,
          bookmarked: isBookmarked
        });
      });
    } catch {
      setIsBookmarked(beforeUpdate);
    }
  };


  const userId = useMemo(() => session && session.user ? (session.user as any)['id'] : "", [session]);
  const isSearchedPosts = useMemo(() => (filterKey ?? FilterKeys.Normal) === FilterKeys.SearchPosts, [filterKey]);
  const onIsAlreadyAdded = async () => {
    const beforeUpdate = isAdded;
    try {
      await checkUserIsLoggedInBeforeUpdatingTweet(async () => {
        setIsAdded(!isAdded);
        onAdd!(postToDisplay);
      });
    } catch {
      setIsAdded(beforeUpdate);
    }
  };


  const moreOptions = useMemo(() => {
    const defaultOpts = [
      {
        title: 'Save to List',
        onClick: async () => {
          showModal(
            <SaveToListModal
              relatedEntityType="post"
              info={postToDisplay}
              onClose={() => {
                const canCloseLoginModal = !(ROUTES_USER_CANT_ACCESS.some(r => window.location.href.includes(r)));
                
                if (currentSessionUser && currentSessionUser.id && canCloseLoginModal)
                    closeModal();
              }}
            />
          )
        },
        Icon: PlusCircleIcon,
      }
    ];

    if(postInfo.userId === currentSessionUser?.id)
      defaultOpts.push(      {
        title: 'Delete Your Post',
        onClick: async () => {
          showModal(
            <ConfirmModal 
              title="Delete this Post"
              confirmButtonClassNames="bg-red-700 text-gray-100"
              onClose={() => closeModal()}
              declineButtonText="Cancel"
              confirmFunc={async () => {
                await deleteYourPost(postInfo.id);
                closeModal();           
              }}
              confirmMessage="Are you sure you want to delete this post forever?"
              confirmButtonText="Delete Post"
            >
              <PostComponent 
                postToDisplay={postToDisplay}
                onlyDisplay={true}
              />
            </ConfirmModal>
          )

        },
        Icon: TrashIcon,
      });

    return defaultOpts;
  }, [postInfo.id]);

  return (
    <div
      className={`
        relative flex flex-col space-x-3 border-y border-gray-100 p-5 
        dark:border-gray-800 ${!onlyDisplay && 'hover:shadow-lg dark:hover:bg-[#000000]'}  
      `}
    >
      {canAdd && (
        <AddOrFollowButton
          isAdded={isAdded ?? false}
          filterKey={filterKey ?? FilterKeys.Normal}
          onIsAlreadyAdded={onIsAlreadyAdded!}
        />
      )}

      <div className="relative flex space-x-3 cursor-pointer">
        <div className='absolute top-0 bg-transparent w-full h-full z-10' 
          onClick={(e) => {
            if(onlyDisplay)
              return;
            else
              return stopPropagationOnClick(e, navigateToTweet)
          }}
        />
        <img
          className="h-10 w-10 rounded-full object-cover"
          src={postToDisplay.profileImg}
          alt={postToDisplay.username}
          onClick={(e) => {
            if(onlyDisplay)
              return;
            else
              return stopPropagationOnClick(e, navigateToTweetUser)
          }}
        />
        <div>
          <div className="flex item-center space-x-1">
            <p
              className={`font-bold mr-1 hover:underline`}
              onClick={(e) => {
                if(onlyDisplay)
                  return;
                else
                  return stopPropagationOnClick(e, navigateToTweetUser);
              }}
            >
              {postToDisplay.username}
            </p>
            {userId === postToDisplay.username && (
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
              onClick={(e) => {
                if(onlyDisplay)
                  return;
                else
                  return stopPropagationOnClick(e, navigateToTweetUser);
              }}
            >
              @
              {postToDisplay.username ? postToDisplay.username.replace(/\s+/g, "") : ""}
              .
            </p>
            <TimeAgo
              className="text-sm text-gray-500 dark:text-gray-400"
              date={convertDateToDisplay(postInfo?.createdAt)}
            />
          </div>
          <p className="pt-1">{postInfo.text}</p>
          {postInfo.image && (
            <div className="w-[300px] h-[200px] overflow-hidden flex justify-center items-center">
              <img
                src={postInfo.image}
                alt="img/post"
                className="m-5 ml-0 w-full h-full object-cover shadow-sm"
              />
            </div>

          )}
        </div>
      </div>

      {!isSearchedPosts && (
        <>
          {!onlyDisplay && (
            <>
              <MoreSection 
                moreOptions={moreOptions}
                moreOptionClassNames="bg-red-700"
              />
              <div className="mt-5 flex justify-between">
                <CommentIconButton
                  onClick={(e) =>
                    stopPropagationOnClick(e, () => {
                      if (!session || !session.user)
                        showModal(<LoginModal />);

                      setCommentBoxOpen(!commentBoxOpen);
                    })}
                  numberOfComments={numberOfComments}
                  disabled={onlyDisplay ?? false}
                />
                <RePostedIconButton
                  onClick={(e) => stopPropagationOnClick(e, onRetweet)}
                  numberOfRePosts={numberOfRetweets}
                  isRePosted={isRePosted}
                  disabled={onlyDisplay ?? false}
                />
                <LikesIconButton
                  onClick={(e) => stopPropagationOnClick(e, onLikeTweet)}
                  numberOfLikes={numberOfLikes}
                  isLiked={isLiked}
                  disabled={onlyDisplay ?? false}
                />
                <div className="flex gap-2">
                  <BookmarkedIconButton
                    onClick={(e) => stopPropagationOnClick(e, onBookmarkTweet)}
                    isBookmarked={isBookmarked}
                    disabled={onlyDisplay ?? false}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex cursor-pointer item-center space-x-3 text-gray-400"
                    disabled={onlyDisplay ?? false}
                  >
                    <UploadIcon className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {!isSearchedPosts && commentBoxOpen && (
        <>
          {userId && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className='flex flex-col justify-items-start'
            >
              <form
                onSubmit={handleSubmit}
                className="mt-3 flex space-x-3"
              >
                {image && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className='relative'
                  >
                    <button
                      onClick={() => setImage("")} // Replace with your close logic
                      className="absolute left-2 top-2 z-10 rounded-full bg-red-800 p-2 text-white hover:bg-red-700 focus:outline-none"
                      aria-label="Close"
                    >
                      <XIcon className="h-5 w-5" /> 
                    </button>
                    <div className='w-[300px] h-[200px] overflow-hidden flex justify-center items-center'>
                      <NextImage
                        className="mt-10 w-full h-full object-cover shadow-lg"
                        src={image}
                        width={20}
                        height={20}
                        alt="image/tweet"
                      />
                    </div>
                  </motion.div>
                )}
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 rounded-lg bg-gray-100 p-2 outline-none dark:bg-gray-700"
                  type="text"
                  placeholder="Write a comment..."
                />
                <button
                  disabled={!input}
                  type="submit"
                  className="text-maydan disabled:text-gray-200 cursor-pointer"
                >
                  Post
                </button>
              </form>
              <UpsertBoxIconButton setInput={setInput} input={input} setImage={setImage} />
            </motion.div>
          )}
        </>
      )}
      {!isSearchedPosts && commentBoxOpen && (
        <>
          {loadingComments
            ? (<ModalLoader />)
            : (
              <>
                {currentComments?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="my-2 mt-5 max-h-44 space-y-5 overflow-y-scroll border-t border-gray-100 p-5 scrollbar-thin scrollbar-thumb-blue-100"
                  >
                    {currentComments.map((comment: CommentToDisplay) => (
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
                              date={convertDateToDisplay(comment.createdAt)}
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
        </>
      )}
    </div>
  );
}

export default PostComponent;
