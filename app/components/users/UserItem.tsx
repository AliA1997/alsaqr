"use client";
import { useRouter } from "next/navigation";
import React, {
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {UserItemToDisplay } from "../../../typings";
import {
    getPercievedNumberOfRecord,
    stopPropagationOnClick,
} from "@utils/neo4j/index";
import { useSession } from "next-auth/react";
import { FilterKeys, useStore } from "@stores/index";
import { LoginModal } from "../common/AuthModals";
import { convertDateToDisplay, shortenText } from "@utils/neo4j/neo4j";
import { MAX_BIO_LENGTH_FEED } from "@utils/constants";
import { observer } from "mobx-react-lite";
import { AddOrFollowButton } from "../common/IconButtons";

interface Props {
    filterKey: FilterKeys;
    userItemToDisplay: UserItemToDisplay;
    usersAlreadyFollowedOrAddedIds: string[];
    canAddOrFollow: boolean;
    onModal: boolean;
    onAddOrFollow?: Function;
    loggedInUserId?: string;
}

function UserItemComponent({
    userItemToDisplay,
    usersAlreadyFollowedOrAddedIds,
    filterKey,
    onModal,
    onAddOrFollow,
    canAddOrFollow,
    loggedInUserId
}: Props) {
    const router = useRouter();
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
        if (!loggedInUserId) return showModal(<LoginModal />)

        await callback();
    };

    useLayoutEffect(() => {
        if (loggedInUserId) {
            // alert(JSON)
            const alreadyFollowedOrAdded = usersAlreadyFollowedOrAddedIds?.some((userById: string) => userById == userItemInfo.id) ?? false;
            console.log(JSON.stringify(usersAlreadyFollowedOrAddedIds))
            if (filterKey === FilterKeys.SearchUsers) {
                initiallyBooleanValues.current.added = alreadyFollowedOrAdded;
                setIsAdded(alreadyFollowedOrAdded);
            }
            else {
                initiallyBooleanValues.current.following = alreadyFollowedOrAdded;
                setIsFollowing(alreadyFollowedOrAdded);
            }
        }
    }, []);


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
                debugger;
                onAddOrFollow!(userItemToDisplay);
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
                await onAddOrFollow!(userItemToDisplay);
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
                {canAddOrFollow && (
                    <AddOrFollowButton
                     isAdded={isAdded}
                     isFollowing={isFollowing}
                     filterKey={filterKey}
                     onIsAlreadyAdded={onIsAlreadyAdded}
                     onIsAlreadyFollowing={onIsAlreadyFollowing}
                    />
                )}
 
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
                            <p className='italic text-gray-400 text-sm'>
                                {shortenText(userItemInfo.bio ?? "", MAX_BIO_LENGTH_FEED)}
                            </p>
                            <div className='flex item-center justify-items-start space-x-3'>
                                <p className='italic text-gray-400 text-sm'>
                                    {(userItemToDisplay.following ?? []).length} Following
                                </p>
                                <p className='italic text-gray-400 text-sm'>
                                    {(userItemToDisplay.followers ?? []).length} Followers
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default UserItemComponent;



            //    {canAddOrFollow && (
            //         <div className='p-1'>

            //             {isAdded || isFollowing
            //                 ? (
            //                     <button
            //                         type='button'
            //                         onClick={filterKey === FilterKeys.SearchUsers ? onIsAlreadyAdded : onIsAlreadyFollowing}
            //                         className={`w-[2.5rem] h-[2.5rem] border rounded-full bg-maydan p-2 hover:bg-[transparent]`}
            //                     >
            //                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            //                             <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            //                         </svg>
            //                     </button>
            //                 )
            //                 : (
            //                     <button
            //                         type='button'
            //                         onClick={filterKey === FilterKeys.SearchUsers ? onIsAlreadyAdded : onIsAlreadyFollowing}
            //                         className='w-[2.5rem] h-[2.5rem] border rounded-full p-2 hover:bg-maydan cursor-pointer'
            //                     >
            //                         {filterKey === FilterKeys.SearchUsers
            //                             ? (
            //                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            //                                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            //                                 </svg>
            //                             )
            //                             : (
            //                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            //                                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            //                                 </svg>
            //                             )}
            //                     </button>
            //                 )
            //             }
            //         </div>
            //     )}