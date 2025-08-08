"use client";
import React from "react";
import dynamic from 'next/dynamic';
import { observer } from "mobx-react-lite";
import { convertDateToDisplay } from "@utils/neo4j/neo4j";
import { FilterKeys, useStore } from "@stores/index";
import RequestedInvitesModal from "@components/common/RequestedInvitesModal";
import type { CommunityDiscussionAdminInfo } from "models/community";
const InfoCardContainer = dynamic(() => import( "@components/common/Containers").then(mod => mod.InfoCardContainer), { ssr: false });
const TagOrLabel = dynamic(() => import("@components/common/Titles").then(mod => mod.TagOrLabel), { ssr: false });
const CommonLink = dynamic(() => import("@components/common/Links").then(mod => mod.CommonLink), { ssr: false });
const UpdateCommunityModal = dynamic(() => import("@components/common/UpdateCommunityModal"), { ssr: false });

type Props = {
    communityDiscussionAdminInfo: CommunityDiscussionAdminInfo;
    refreshCommunityDiscussionAdminInfo: (communityId: string) => Promise<void>;
}

function CommunityDiscussionAdminView({
    communityDiscussionAdminInfo,
    refreshCommunityDiscussionAdminInfo
}: Props) {
    const { authStore, modalStore } = useStore();
    const { currentSessionUser } = authStore;
    const { showModal } = modalStore;
    
    if (communityDiscussionAdminInfo)
        return (
            <>
                <div className='flex justify-between p-5'>
                     <h1 className='text-4xl'>
                        {`A Discussion Starter Welcome `}
                    </h1>
                    {/* <CommonLink 
                        onClick={() => showModal(<UpdateCommunityModal 
                                                    loggedInUserId={currentSessionUser?.id!}
                                                    communityAdminInfo={c}
                                                    refreshCommunityAdminInfo={refreshCommunityAdminInfo}
                                                />
                        )}
                        animatedLink={false}
                        classNames='border border-[0.1rem] hover:text-maydan'
                    >
                        Edit Community Discussion 
                    </CommonLink> */}
                </div>
                <div className='relative flex'> 
                    <InfoCardContainer>
                        <h1 className='text-3xl'>
                            {communityDiscussionAdminInfo.communityDiscussion.name}
                        </h1>
                    </InfoCardContainer>
                    <TagOrLabel 
                        color={communityDiscussionAdminInfo.communityDiscussion.isPrivate ? 'danger' : 'info'} 
                        size='sm' 
                        className='absolute bottom-0 right-0'
                    >
                        {communityDiscussionAdminInfo.communityDiscussion.isPrivate ? 'Private' : 'Public'}
                    </TagOrLabel>
                </div>
                <div className="flex flex-5">
                    <InfoCardContainer>
                        <p className='absolute left-0 top-0 w-full text-center text-sm text-gray-700 dark:text-gray-100'>Invited Users:</p>
                        <h1 className='w-full text-center text-3xl'>
                            {communityDiscussionAdminInfo.invitedCount}
                        </h1>
                    </InfoCardContainer>
                    <InfoCardContainer>
                        <p className='absolute left-0 top-0 w-full text-center text-sm text-gray-700 dark:text-gray-100'>Joined Users:</p>
                        <h1 className='w-full text-center text-3xl'>
                            {communityDiscussionAdminInfo.joinedCount}
                        </h1>
                    </InfoCardContainer>
                    {communityDiscussionAdminInfo.communityDiscussion.isPrivate && (
                        <InfoCardContainer>
                            <p className='absolute left-0 top-0 w-full text-center text-sm text-gray-700 dark:text-gray-100'>Pending Invites:</p>
                            <h1 className='w-full text-center text-3xl'>
                                {communityDiscussionAdminInfo.inviteRequestedUsers?.length ?? 0}
                            </h1>
                            <button
                                type='button'
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    showModal(
                                        <RequestedInvitesModal
                                            invitedUsers={communityDiscussionAdminInfo.inviteRequestedUsers}
                                            title="Pending Invite Requests"
                                            filterKey={FilterKeys.CommunityDiscussion}
                                            entityInvitedToId={communityDiscussionAdminInfo.communityDiscussion.communityId}
                                            childEntityInviteToId={communityDiscussionAdminInfo.communityDiscussion.id}
                                        />
                                    );
                                }}
                                className={`
                                min-w-[4rem] max-w-[12rem] max-h-[3rem] border px-3 py-1 
                                font-bold 
                                text-gray-900
                                dark:text-white 
                                hover:text-maydan
                                hover:opacity-90
                                disabled:opacity-40
                                text-xs
                                flex
                                `}
                            >Accept Or Deny Invites</button>
                        </InfoCardContainer>
                    )}
                    <InfoCardContainer>
                        <p className='absolute left-0 top-0 w-full text-center text-sm text-gray-700 dark:text-gray-100'>Created on: </p>
                        <h1 className='w-full text-center mt-2'>
                            {new Date(convertDateToDisplay(communityDiscussionAdminInfo.communityDiscussion.createdAt)).toLocaleString('default', { dateStyle: 'short' })}
                        </h1>
                    </InfoCardContainer>
                    <InfoCardContainer classNames='justify-end items-center'>
                        <p className='absolute left-0 top-0 w-full text-center text-sm text-gray-700 dark:text-gray-100'>Tags:</p>

                        <div className='flex flex-wrap'>
                            {communityDiscussionAdminInfo.communityDiscussion.tags && communityDiscussionAdminInfo.communityDiscussion.tags.map((t: string, tIdx: number) =>
                                <div key={tIdx}>
                                    <TagOrLabel 
                                        color='secondary' 
                                        size='sm' 
                                    >
                                        #{t}
                                    </TagOrLabel>
                                </div>)}
                        </div>
                    </InfoCardContainer>
                </div>
            </>
        );

    return <></>
}

export default observer(CommunityDiscussionAdminView);