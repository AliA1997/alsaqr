"use client";
import { useRouter } from "next/navigation";
import React, {
    useCallback,
    useMemo,
    useState,
} from "react";

import {UserItemToDisplay } from "../../../typings";
import {
    stopPropagationOnClick,
} from "@utils/neo4j/index";
import { FilterKeys, useStore } from "@stores/index";
import { shortenText } from "@utils/neo4j/neo4j";
import { MAX_BIO_LENGTH_FEED } from "@utils/constants";
import { ButtonLoader } from "@components/common/CustomLoader";
import { XIcon } from "@heroicons/react/solid";
import { CheckIcon } from "@heroicons/react/outline";
import { observer } from "mobx-react-lite";
import { AbsoluteDangerButton, AbsoluteSuccessButton } from "@components/common/Buttons";
import { OptimizedImage } from "@components/common/Image";

interface Props {
    userItemToDisplay: UserItemToDisplay;
    filterKey: FilterKeys;
    entityInvitedToId: string;
    childEntityInviteToId?: string;
}

function UserInviteItemComponent({
    userItemToDisplay,
    filterKey,
    entityInvitedToId,
    childEntityInviteToId
}: Props) {
    const router = useRouter();
    const { communityFeedStore, communityDiscussionFeedStore, modalStore } = useStore();
    const userItemInfo = userItemToDisplay.user;
    const { closeModal } = modalStore;
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [decisionMade, setDecisionMade] = useState<"accept" | "deny" | undefined>(undefined);
    const acceptInvite = useCallback(async () => {
        setDecisionMade("accept");

        if(filterKey === FilterKeys.CommunityDiscussion) 
            await communityDiscussionFeedStore.acceptRequestToJoinPrivateCommunityDiscussion(
                entityInvitedToId, 
                childEntityInviteToId!,
                userItemToDisplay.user.id,
                {
                    accept: true
                });
        else 
            await communityFeedStore.acceptRequestToJoinPrivateCommunity(
                entityInvitedToId, 
                userItemToDisplay.user.id,
                {
                    accept: true
                });

        setDecisionMade(undefined);
    }, [filterKey, userItemToDisplay.user]);

    const denyInvite = useCallback(async () => {
        setDecisionMade("deny");
        if(filterKey === FilterKeys.CommunityDiscussion) 
            await communityDiscussionFeedStore.acceptRequestToJoinPrivateCommunityDiscussion(
                entityInvitedToId, 
                childEntityInviteToId!,
                userItemToDisplay.user.id,
                {
                    deny: true
                });
        else 
            await communityFeedStore.acceptRequestToJoinPrivateCommunity(
                entityInvitedToId, 
                userItemToDisplay.user.id,
                {
                    deny: true
                })

        setDecisionMade(undefined);
    }, [filterKey, userItemToDisplay.user])

    const navigateToUser = () => router.push(`users/${userItemInfo.username}`);
    // const denyId = useMemo(() => `${userItemToDisplay.user.id}_deny`, [])
    // const acceptId = useMemo(() => `${userItemToDisplay.user.id}_accept`, [])
    
    return (
        <>
            <div
                className={
                    `flex relative space-x-3 border-y border-gray-100 p-5 dark:border-gray-800 
                    rounded-sm w-full h-[7em]
                `}
            >
                <div className="flex flex-col justify-self-stretch grow justify-start h-full space-x-3 cursor-pointer">
                    <div className="flex justify-items-start items-end align-items-end space-x-2">
                        <OptimizedImage
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
                                <AbsoluteSuccessButton
                                    disabled={submitting ?? false}
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        setSubmitting(true);
                                        await acceptInvite();
                                        setSubmitting(false);
                                        closeModal();
                                    }}
                                >
                                    {decisionMade === "accept" ? (
                                        <ButtonLoader />
                                    ) : (
                                        <>
                                            <span className={`mt-1`}>
                                                Accept
                                            </span>
                                            <CheckIcon className="h-[1.6rem] w-[1.6rem]" />
                                        </>
                                    )}
                                </AbsoluteSuccessButton>
                                <AbsoluteDangerButton
                                    disabled={submitting}
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        setSubmitting(true);
                                        await denyInvite();
                                        setSubmitting(false);
                                        closeModal();
                                    }}
                                >
                                    {decisionMade === "deny" ? (
                                        <ButtonLoader />
                                    ) : (
                                        <>
                                            <span className={`mt-1`}>
                                                Deny
                                            </span>
                                            <XIcon className="h-[1.6rem] w-[1.6rem]" />
                                        </>
                                    )}
                                </AbsoluteDangerButton>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default observer(UserInviteItemComponent);

