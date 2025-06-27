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

import { Comment, CommentToDisplay, CommunityToDisplay, ListToDisplay, User, UserItemToDisplay } from "../../typings";
import {
    getPercievedNumberOfRecord,
    stopPropagationOnClick,
} from "@utils/neo4j/index";
import { useSession } from "next-auth/react";
import { FilterKeys, useStore } from "@stores/index";
import { LoginModal } from "./common/AuthModals";
import { convertDateToDisplay } from "@utils/neo4j/neo4j";

interface Props {
    filterKey: FilterKeys;
    userItemToDisplay: UserItemToDisplay;
    usersAlreadyFollowedOrAddedIds: string[];
    onAddOrFollow: (user: User) => Promise<void>;
    onModal: boolean;
}

function UserItemComponent({
    onAddOrFollow,
    userItemToDisplay,
    usersAlreadyFollowedOrAddedIds,
    filterKey,
    onModal
}: Props) {
    const router = useRouter();
    const { data: session } = useSession();
    const { modalStore } = useStore();
    const { showModal, closeModal } = modalStore;

    const userItemInfo = userItemToDisplay.user;
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    // For cases such as adding users to communities or lists.
    const [isAdded, setIsAdded] = useState<boolean>(false);

    const initiallyBooleanValues = useRef<{
        following: boolean;
        added: boolean;
    }>({
        following: false,
        added: false
    });

    // const refreshComments = async () => {
    //   const comments: Comment[] = await fetchComments(communityInfo.id);
    //   setCurrentComments(comments);
    // };
    const checkUserIsLoggedInBeforeUpdatingUserItem = async (
        callback: () => Promise<void>
    ) => {
        if (session && session.user && !(session.user as any)['id']) return showModal(<LoginModal />)

        await callback();
    };

    useLayoutEffect(() => {
        if (session && session.user && (session.user as any)['id']) {

            const alreadyFollowedOrAdded = usersAlreadyFollowedOrAddedIds?.some((userById: string) => userById == userItemInfo.id) ?? false;

            if (filterKey === FilterKeys.SearchUsers)
                initiallyBooleanValues.current.added = alreadyFollowedOrAdded;
            else
                initiallyBooleanValues.current.following = alreadyFollowedOrAdded;
        }
    }, [session]);


    const navigateToUser = () => {
        if (onModal)
            closeModal();

        router.push(`users/${userItemInfo.username}`);
    };

    const onIsAlreadyAdded = async () => {
        const beforeUpdate = isAdded;
        try {
            await checkUserIsLoggedInBeforeUpdatingUserItem(async () => {
                setIsAdded(!isAdded);
                await onAddOrFollow(userItemInfo);
            });
        } catch {
            setIsAdded(beforeUpdate);
        }
    };

    const onIsAlreadyFollowing = async () => {
        const beforeUpdate = isFollowing;
        try {
            await checkUserIsLoggedInBeforeUpdatingUserItem(async () => {
                setIsFollowing(!isFollowing);
                await onAddOrFollow(userItemInfo);
            });
        } catch {
            setIsFollowing(beforeUpdate);
        }
    };

    return (
        <>
            <div
                className={
                    `flex relative space-x-3 border-y border-gray-100 p-5 dark:border-gray-800 rounded-sm w-full h-[7em]
        `}
            >
                <div className='p-1'>

                    {isAdded || isFollowing
                        ? (
                            <button
                                type='button'
                                className={`w-[2.5rem] h-[2.5rem] border rounded-full bg-maydan p-2 hover:bg-[transparent]`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                            </button>
                        )
                        : (
                            <button
                                type='button'
                                onClick={() => setIsAdded(true)}
                                className='w-[2.5rem] h-[2.5rem] border rounded-full p-2 hover:bg-maydan cursor-pointer'
                            >
                                {filterKey === FilterKeys.SearchUsers
                                    ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                    )
                                    : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                    )}
                            </button>
                        )
                    }
                </div>
                {/* <div className="absolute m-0 inset-0"></div> */}
                <div className="flex flex-col justify-self-stretch grow justify-start h-full space-x-3 cursor-pointer bg-red-900">
                    <div className="flex justify-items-start items-end align-items-end space-x-2">
                        <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={userItemInfo.avatar}
                            alt={userItemInfo.username}
                            onClick={(e) => stopPropagationOnClick(e, navigateToUser)}
                        />
                        <div className='flex flex-col items-start'>
                            <h6>
                                {userItemInfo.username}
                            </h6>
                            <div className='flex item-center justify-items-start space-x-3'>
                                <p className='italic text-gray-300 text-sm'>
                                    {(userItemToDisplay.following ?? []).length} Following
                                </p>
                                <p className='italic text-gray-300 text-sm'>
                                    {(userItemToDisplay.followers ?? []).length} Followers
                                </p>
                            </div>

                        </div>
                        <TimeAgo
              className="text-sm bg-red-100 text-gray-500 dark:text-gray-400"
              date={convertDateToDisplay(userItemInfo.createdAt)}
            />
                    </div>
                </div>
            </div>
        </>
    );
}

export default UserItemComponent;
