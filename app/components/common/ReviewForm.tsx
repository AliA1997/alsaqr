import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { CommonUpsertBoxTypes, PostToDisplay, User, UserItemToDisplay } from "typings.d";
import UserItemComponent from "@components/users/UserItem";
import { FilterKeys } from "@stores/index";
import { ProfileImagePreview } from "./Containers";
import PostComponent from "@components/posts/Post";
import { NoRecordsTitle } from "./Titles";

interface Section {
    jsx: React.ReactNode;
    title: string;
}

interface Props {
    sections: Section[];
    type: CommonUpsertBoxTypes;
    hideTitle?: boolean;
    previewInfo?: {
        avatar: string;
        bgThumbnail: string;
        username: string;
    }
}

interface ReviewNewCommunityProps {
    name: string;
    avatarOrImage: string;
    visibility: any;
    tags: string[];
    type: CommonUpsertBoxTypes;
}

interface ReviewUsersAddedProps {
    usersAdded: UserItemToDisplay[];
}

interface ReviewPostsAddedProps {
    postsAdded: PostToDisplay[];
}

export const ReviewUsersAdded = ({
    usersAdded
}: ReviewUsersAddedProps) => {
    const usersAddedByIds = useMemo(() => usersAdded.map(u => u.user.id), [usersAdded]);
    return (
        <div className='flex flex-col'>
            {usersAdded && usersAdded.length
                ? usersAdded.map((u: UserItemToDisplay, uIdx: number) => (
                    <UserItemComponent
                        key={u.user.id ?? uIdx}
                        userItemToDisplay={u}
                        filterKey={FilterKeys.SearchUsers}
                        usersAlreadyFollowedOrAddedIds={usersAddedByIds}
                        canAddOrFollow={false}
                        onModal={true}
                    />
                ))
                :  <NoRecordsTitle>No Users Added</NoRecordsTitle>}
        </div>
    )
};

export const ReviewPostsAdded = ({
    postsAdded
}: ReviewPostsAddedProps) => {
    const postsAddedByIds = useMemo(() => postsAdded.map(p => p.post.id), [postsAdded]);
    return (
        <div className='flex flex-col'>
            {postsAdded && postsAdded.length
                ? postsAdded.map((postToDisplay: PostToDisplay, postIdx: number) => (
                <PostComponent
                  filterKey={FilterKeys.SearchPosts}
                  key={postToDisplay.post.id ?? postIdx}
                  postToDisplay={postToDisplay}
                />
                ))
                : <NoRecordsTitle>No Posts Added</NoRecordsTitle>}
        </div>
    )
};


export const ReviewUpsertListOrCommunity = ({
    name,
    avatarOrImage,
    visibility,
    tags,
    type
}: ReviewNewCommunityProps) => (
    <div className='flex flex-col'>
        {!(type === CommonUpsertBoxTypes.CommunityDiscussion || type === CommonUpsertBoxTypes.UpdateCommunity) && (
            <div className='flex flex-col x-space-3 justify-items-between'>
                <h5 className='font-bold mr-2'>
                    {type === CommonUpsertBoxTypes.Community ? 'Community Avatar' : 'List Banner Image'}:
                </h5>
                <img
                    src={avatarOrImage}
                    alt={name}
                    className='h-[5em] w-[5em] rounded-full'
                />
            </div>
        )}

        <div className='flex x-space-3 justify-items-between'>
            <h5 className='font-bold mr-2'>
                {type === CommonUpsertBoxTypes.Community 
                    ? 'Community Name' 
                    : type === CommonUpsertBoxTypes.CommunityDiscussion
                        ? 'Discussion Name'
                        : 'List Name'}:
            </h5>
            <p>{name}</p>
        </div>

        {(type === CommonUpsertBoxTypes.Community || type === CommonUpsertBoxTypes.UpdateCommunity) && (
            <div className='flex x-space-3 justify-items-between'>
                <h5 className='font-bold mr-2'>Visibility:</h5>
                <p>{visibility === 'private' ? 'Private' : 'Public'}</p>
            </div>
        )}

        <div className='flex x-space-3 justify-items-between'>
            <h5 className='font-bold mr-2'>Hashtags:</h5>
            {
                tags && tags.length
                    ? tags.map((t, tIdx) => <p key={tIdx}>{t}</p>)
                    : null
            }
        </div>
    </div>
);

// vatar: userInfo?.avatar ?? '',
//               bgThumbnail: userInfo?.bgThumbnail ?? '',
//               username: userInfo?.username ?? '',
//               email: userInfo?.email ?? '',
//               firstName: userInfo?.firstName ?? '',
//               lastName: '',
//               dateOfBirth: userInfo?.dateOfBirth,
//               countryOfOrigin: userInfo?.countryOfOrigin ?? '',
//               hobbies: userInfo?.hobbies ?? [],
//               maritalStatus: userInfo?.maritalStatus ?? "single",
//               religion: userInfo?.religion ??  "Prefer Not To Disclose",
interface ReviewUserPersonalInfoProps {
    avatar: string;
    bgThumbnail: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date | undefined;
}

interface ReviewUserHobbiesAndOtherInfoProps {
    countryOfOrigin: string;
    hobbies: string[];
    maritalStatus: string;
    religion: string;
}

export const ReviewUserPersonalInfo = ({
    // avatar,
    // bgThumbnail,
    username,
    email,
    firstName,
    lastName,
    dateOfBirth
}: ReviewUserPersonalInfoProps) => (
    <div className='flex flex-col'>

        <div className='flex x-space-3 justify-items-between'>
            <h5 className='font-bold mr-2'>Username:</h5>
            <p>@{username}</p>
        </div>
        
        <div className='flex x-space-3 justify-items-between'>
            <h5 className='font-bold mr-2'>Name:</h5>
            <p>{firstName.trim()} {lastName.trim()}</p>
        </div>

        <div className='flex x-space-3 justify-items-between'>
            <h5 className='font-bold mr-2'>Email:</h5>
            <p>{email}</p>
        </div>
        
        <div className='flex x-space-3 justify-items-between'>
            <h5 className='font-bold mr-2'>Date of Birth:</h5>
            <p>{dateOfBirth ? new Intl.DateTimeFormat("en-US").format(dateOfBirth) : ''}</p>
        </div>
    </div>
);


export const ReviewUserHobbiesAndOtherInfo = ({
    countryOfOrigin,
    hobbies,
    maritalStatus,
    religion
}: ReviewUserHobbiesAndOtherInfoProps) => (
    <div className='flex flex-col'>

        <div className='flex x-space-3 justify-items-between'>
            <h5 className='font-bold mr-2'>Country of Origin:</h5>
            <p>{countryOfOrigin}</p>
        </div>
        
        <div className='flex x-space-3 justify-items-between'>
            <h5 className='font-bold mr-2'>Hobbies:</h5>
            {
                hobbies && hobbies.length
                    ? hobbies.map((hobby, hobbyIdx) => <p key={hobbyIdx}>{hobby}</p>)
                    : null
            }
        </div>

        <div className='flex x-space-3 justify-items-between'>
            <h5 className='font-bold mr-2'>Marital Status:</h5>
            <p>{maritalStatus}</p>
        </div>
        
        <div className='flex x-space-3 justify-items-between'>
            <h5 className='font-bold mr-2'>Religion:</h5>
            <p>{religion}</p>
        </div>
    </div>
);


export const ReviewForm = observer(({ sections, hideTitle, previewInfo, type }: Props) => {
    const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

    const toggleSection = (index: number) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const isExpanded = (index: number) => expandedSections.has(index);

    return (
        <div className="w-full border rounded-lg overflow-hidden shadow-sm">
            {!hideTitle && <h3 className="font-medium text-lg p-4">Review Form</h3>}
            {type === CommonUpsertBoxTypes.Register && previewInfo && (
                <ProfileImagePreview 
                    avatar={previewInfo.avatar}
                    bgThumbnail={previewInfo.bgThumbnail}
                    username={previewInfo.username}
                />
            )}

            <div className="divide-y">
                {sections.map((section, index) => (
                    <div key={index} className="group">
                        <button
                            type="button"
                            className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleSection(index);
                            }}
                            aria-expanded={isExpanded(index)}
                            aria-controls={`section-${index}`}
                        >
                            <h4 className="font-medium text-gray-700">{section.title}</h4>
                            <motion.div
                                animate={{ rotate: isExpanded(index) ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="size-5 text-gray-500"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                                    />
                                </svg>
                            </motion.div>
                        </button>

                        <motion.div
                            initial={false}
                            animate={{
                                height: isExpanded(index) ? "auto" : 0,
                                opacity: isExpanded(index) ? 1 : 0
                            }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div
                                id={`section-${index}`}
                                className="px-4 pb-4"
                            >
                                {section.jsx}
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>
        </div>
    );
});