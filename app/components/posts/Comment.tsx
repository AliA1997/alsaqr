"use client";
import { PlusCircleIcon, UploadIcon, XIcon } from "@heroicons/react/outline";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, {
    useEffect,
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
import { TagOrLabel } from "@components/common/Titles";

interface Props {
    commentToDisplay: CommentToDisplay;
    showLabel?: boolean;
    onlyDisplay?: boolean;
}

function CommentComponent({
    commentToDisplay,
    showLabel,
    onlyDisplay
}: Props) {
    const router = useRouter();
    const { data: session } = useSession();
    const { authStore, commentFeedStore, modalStore } = useStore();
    const { currentSessionUser } = authStore;
    const { showModal, closeModal } = modalStore;
    const [mounted, setMounted] =useState<boolean>(false);
    const {
        rePostComment,
        likedComment,
        loadComments,
        deleteYourComment
    } = commentFeedStore;
    const [isRePosted, setIsRePosted] = useState<boolean>(false);
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const userId = useMemo(() => session && session.user ? (session.user as any)['id'] : "", [session]);

    const initiallyBooleanValues = useRef<{
        reposted: boolean;
        liked: boolean;
    }>({
        reposted: false,
        liked: false,
    });


    const refreshComments = async () => {
        await loadComments(commentToDisplay.postId);
    };

    useEffect(() => {
        setMounted(true);

        return () => {
            setMounted(false);
        }
    }, [])

    useLayoutEffect(
        () => {
            const isLikedBefore = commentToDisplay.likers.some(l => l.id === currentSessionUser?.id);
            const isRepostedBefore = commentToDisplay.reposters.some(rp => rp.id === currentSessionUser?.id);
            
            initiallyBooleanValues.current = {
                liked: mounted ? isLiked : isLikedBefore,
                reposted: mounted ? isRePosted : isRepostedBefore
            };
            
        }, 
        [commentToDisplay.id, refreshComments]
    );

    useEffect(() => {
        
        setIsLiked(initiallyBooleanValues.current?.liked ?? false);
        setIsRePosted(initiallyBooleanValues.current?.reposted ?? false);
    }, [initiallyBooleanValues.current])

    const numberOfRePosts = useMemo(
        () =>
            getPercievedNumberOfRecord<User>(
                isRePosted,
                initiallyBooleanValues.current?.reposted,
                commentToDisplay.reposters ?? [],
                mounted,
                currentSessionUser?.id
            ),
        [isRePosted]
    );
    const numberOfLikes = useMemo(
        () =>
            getPercievedNumberOfRecord<User>(
                isLiked,
                initiallyBooleanValues.current?.liked,
                commentToDisplay.likers ?? [],
                mounted,
                currentSessionUser?.id
            ),
        [isLiked]
    );

    const checkUserIsLoggedInBeforeUpdatingComment = async (
        callback: () => Promise<void>
    ) => {
        if (session && session.user && !(session.user as any)['id']) return showModal(<LoginModal />);

        await callback();
    };


    const navigateToCommentUser = () => {
        router.push(`users/${commentToDisplay.username}`);
    };

    const navigateToComment = () => {
        router.push(`status/${commentToDisplay.id}`);
    };

    const onLikeComment = async () => {
        const beforeUpdate = isLiked;
        try {
            await checkUserIsLoggedInBeforeUpdatingComment(async () => {
                setIsLiked(!isLiked);
                await likedComment({
                    statusId: commentToDisplay.id,
                    userId: userId!,
                    liked: isLiked
                });
                
            });
        } catch {
            setIsLiked(beforeUpdate);
        }
    };

    const onRepostComment = async () => {
        const beforeUpdate = isRePosted;
        try {
            await checkUserIsLoggedInBeforeUpdatingComment(async () => {
                setIsRePosted(!isRePosted);

                await rePostComment({
                    statusId: commentToDisplay.id,
                    userId: userId!,
                    reposted: isRePosted
                });
            });
        } catch {
            setIsRePosted(beforeUpdate);
        }
    };


    const moreOptions = useMemo(() => {
        const defaultOpts = [];

        if (commentToDisplay.userId === currentSessionUser?.id)
            defaultOpts.push({
                title: 'Delete Your Comment',
                onClick: async () => {
                    showModal(
                        <ConfirmModal
                            title="Delete this Comment"
                            confirmButtonClassNames="bg-red-700 text-gray-100"
                            onClose={() => closeModal()}
                            declineButtonText="Cancel"
                            confirmFunc={async () => {
                                await deleteYourComment(commentToDisplay.id);
                                closeModal();
                                refreshComments();
                            }}
                            confirmMessage="Are you sure you want to delete this comment forever?"
                            confirmButtonText="Delete Comment"
                        >
                            <CommentComponent
                                commentToDisplay={commentToDisplay}
                                onlyDisplay={true}
                            />
                        </ConfirmModal>
                    )

                },
                Icon: TrashIcon,
            });

        return defaultOpts;
    }, [commentToDisplay.id]);


    return (
        <div
            className={`
                relative flex flex-col space-x-3 border-y border-gray-100 p-5 
                dark:border-gray-800 ${!onlyDisplay && 'hover:shadow-lg dark:hover:bg-[#000000]'}  
            `}
        >
            {showLabel && (
                <TagOrLabel 
                    color="commentGradient"
                    size="md"
                    className="absolute top-0 right-0"
                >
                    Comment
                </TagOrLabel>
            )}
            <div className="relative flex space-x-3 cursor-pointer">
                <div className='absolute top-0 bg-transparent w-[95%] h-full z-10'
                    onClick={(e) => {
                        if (onlyDisplay)
                            return;
                        else
                            return stopPropagationOnClick(e, navigateToComment)
                    }}
                />
                <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={commentToDisplay.profileImg}
                    alt={commentToDisplay.username}
                    onClick={(e) => {
                        if (onlyDisplay)
                            return;
                        else
                            return stopPropagationOnClick(e, navigateToCommentUser)
                    }}
                />
                <div>
                    <div className="flex item-center space-x-1">
                        <p
                            className={`font-bold mr-1 hover:underline`}
                            onClick={(e) => {
                                if (onlyDisplay)
                                    return;
                                else
                                    return stopPropagationOnClick(e, navigateToCommentUser);
                            }}
                        >
                            {commentToDisplay.username}
                        </p>
                        {userId === commentToDisplay.username && (
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
                                if (onlyDisplay)
                                    return;
                                else
                                    return stopPropagationOnClick(e, navigateToCommentUser);
                            }}
                        >
                            @
                            {commentToDisplay.username ? commentToDisplay.username.replace(/\s+/g, "") : ""}
                            .
                        </p>
                        <TimeAgo
                            className="text-sm text-gray-500 dark:text-gray-400"
                            date={convertDateToDisplay(commentToDisplay?.createdAt)}
                        />
                    </div>
                    <p className="pt-1  w-full">{commentToDisplay.text}</p>
                    {commentToDisplay.image && (
                        <div className="w-[300px] h-[200px] overflow-hidden flex justify-center items-center">
                            <img
                                src={commentToDisplay.image}
                                alt="img/post"
                                className="m-5 ml-0 w-full h-full object-cover shadow-sm"
                            />
                        </div>

                    )}
                </div>
            </div>

            {!onlyDisplay && (
                <>
                    {moreOptions.length ?
                        (
                            <MoreSection
                                moreOptions={moreOptions}
                                moreOptionClassNames="bg-red-700"
                            />
                        )
                        : null
                    }
                    <div className="mt-5 flex justify-between">
                        <RePostedIconButton
                            onClick={(e) => stopPropagationOnClick(e, onRepostComment)}
                            numberOfRePosts={numberOfRePosts}
                            isRePosted={isRePosted}
                            disabled={onlyDisplay ?? false}
                        />
                        <LikesIconButton
                            onClick={(e) => stopPropagationOnClick(e, onLikeComment)}
                            numberOfLikes={numberOfLikes}
                            isLiked={isLiked}
                            disabled={onlyDisplay ?? false}
                        />
                        <div className="flex gap-2">
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
        </div>
    );
}

export default CommentComponent;
