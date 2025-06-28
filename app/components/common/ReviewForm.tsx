import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { CommonUpsertBoxTypes, PostToDisplay, User, UserItemToDisplay } from "typings.d";
import UserItemComponent from "@components/UserItem";
import { FilterKeys } from "@stores/index";

interface Section {
    jsx: React.ReactNode;
    title: string;
}

interface Props {
    sections: Section[];
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
                : null}
        </div>
    )
};

export const ReviewPostsAdded = ({
    postsAdded
}: ReviewPostsAddedProps) => {
    const postsAddedByIds = useMemo(() => postsAdded.map(p => p.post.id), [postsAdded]);
    return (
        <div className='flex flex-col'>
            {/* {usersAdded && usersAdded.length
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
                : null} */}
        </div>
    )
};


export const ReviewNewListOrCommunity = ({
    name,
    avatarOrImage,
    visibility,
    tags,
    type
}: ReviewNewCommunityProps) => (
    <div className='flex flex-col'>
        <div className='flex flex-col x-space-3 justify-items-between'>
            <h5 className='font-bold'>Community Avatar:</h5>
            <img
                src={avatarOrImage}
                alt={name}
                className='h-[5em] w-[5em] rounded-full'
            />
        </div>

        <div className='flex x-space-3 justify-items-between'>
            <h5 className='font-bold'>Community Name:</h5>
            <p>{name}</p>
        </div>

        {type === CommonUpsertBoxTypes.Community && (
            <div className='flex x-space-3 justify-items-between'>
                <h5 className='font-bold'>Visibility:</h5>
                <p>{visibility === 'private' ? 'Private' : 'Public'}</p>
            </div>
        )}

        <div className='flex x-space-3 justify-items-between'>
            <h5 className='font-bold'>Hashtags:</h5>
            {
                tags && tags.length
                    ? tags.map((t, tIdx) => <p key={tIdx}>{t}</p>)
                    : null
            }
        </div>
    </div>
);

export const ReviewNewList = () => (<div />);


export const ReviewForm = observer(({ sections }: Props) => {
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
            <h3 className="font-medium text-lg p-4">Review Form</h3>

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