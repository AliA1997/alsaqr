"use client";
import React from "react";
import dynamic from 'next/dynamic';
import { observer } from "mobx-react-lite";
import type { CommunityAdminInfo } from "typings";
import { convertDateToDisplay } from "@utils/neo4j/neo4j";
import { useStore } from "@stores/index";
const InfoCardContainer = dynamic(() => import( "@components/common/Containers").then(mod => mod.InfoCardContainer), { ssr: false });
const TagOrLabel = dynamic(() => import("@components/common/Titles").then(mod => mod.TagOrLabel), { ssr: false });
const CommonLink = dynamic(() => import("@components/common/Links").then(mod => mod.CommonLink), { ssr: false });
const UpdateCommunityModal = dynamic(() => import("@components/common/UpdateCommunityModal"), { ssr: false });

type Props = {
    communityAdminInfo: CommunityAdminInfo;
    refreshCommunityAdminInfo: (communityId: string) => Promise<void>;
}

function CommunityAdminView({
    communityAdminInfo,
    refreshCommunityAdminInfo
}: Props) {
    const { authStore, modalStore } = useStore();
    const { currentSessionUser } = authStore;
    const { showModal } = modalStore;
    
    if (communityAdminInfo)
        return (
            <>
                <div className='flex justify-between p-5'>
                     <h1 className='text-4xl'>
                        {`A Founder's Welcome `}
                    </h1>
                    <CommonLink 
                        onClick={() => showModal(<UpdateCommunityModal 
                                                    loggedInUserId={currentSessionUser?.id!}
                                                    communityAdminInfo={communityAdminInfo}
                                                    refreshCommunityAdminInfo={refreshCommunityAdminInfo}
                                                />
                        )}
                        animatedLink={false}
                        classNames='border border-[0.1rem] hover:text-maydan'
                    >
                        Edit Community
                    </CommonLink>
                </div>
                <div className='relative flex'> 
                    <img
                        className="p-1 h-[5rem] w-[5rem] rounded-full object-cover "
                        src={communityAdminInfo.community.avatar}
                        alt={communityAdminInfo.community.name}
                    />
                    <InfoCardContainer>
                        <h1 className='text-3xl'>
                            {communityAdminInfo.community.name}
                        </h1>
                    </InfoCardContainer>
                    <TagOrLabel 
                        color={communityAdminInfo.community.isPrivate ? 'danger' : 'info'} 
                        size='sm' 
                        className='absolute bottom-0 right-0'
                    >
                        {communityAdminInfo.community.isPrivate ? 'Private' : 'Public'}
                    </TagOrLabel>
                </div>
                <div className="flex flex-5">
                    <InfoCardContainer>
                        <p className='absolute left-0 top-0 w-full text-center text-sm text-gray-700 dark:text-gray-100'>Invited Users:</p>
                        <h1 className='w-full text-center text-3xl'>
                            {communityAdminInfo.invitedCount}
                        </h1>
                    </InfoCardContainer>
                    <InfoCardContainer>
                        <p className='absolute left-0 top-0 w-full text-center text-sm text-gray-700 dark:text-gray-100'>Joined Users:</p>
                        <h1 className='w-full text-center text-3xl'>
                            {communityAdminInfo.joinedCount}
                        </h1>
                    </InfoCardContainer>
                    <InfoCardContainer>
                        <p className='absolute left-0 top-0 w-full text-center text-sm text-gray-700 dark:text-gray-100'>Created on: </p>
                        <h1 className='w-full text-center mt-2'>
                            {new Date(convertDateToDisplay(communityAdminInfo.community.createdAt)).toLocaleString('default', { dateStyle: 'short' })}
                        </h1>
                    </InfoCardContainer>
                    <InfoCardContainer classNames='justify-end items-center'>
                        <p className='absolute left-0 top-0 w-full text-center text-sm text-gray-700 dark:text-gray-100'>Tags:</p>

                        <div className='flex flex-wrap'>
                            {communityAdminInfo.community.tags && communityAdminInfo.community.tags.map((t: string, tIdx: number) =>
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

export default observer(CommunityAdminView);