"use client";
import { useRouter } from "next/navigation";
import React, {
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import TimeAgo from "react-timeago";
import { MessageHistoryToDisplay } from "../../../typings";
import { useSession } from "next-auth/react";
import { useStore } from "@stores/index";
import { LoginModal } from "../common/AuthModals";
import { convertDateToDisplay } from "@utils/neo4j/neo4j";

interface Props {
    messageHistoryItem: MessageHistoryToDisplay;
    onClick: () => void;
}

function MessageHistoryItemComponent({
    messageHistoryItem,
    onClick
}: Props) {
    const { authStore, modalStore } = useStore();
    const { currentSessionUser } = authStore;
    const { showModal } = modalStore;

    const [isRead, setIsRead] = useState<boolean>(false);

    const initiallyBooleanValues = useRef<{
        read: boolean;
    }>({
        read: false,
    });


    const checkUserIsLoggedInBeforeUpdatingTweet = async (
        callback: () => Promise<void>
    ) => {
        if (currentSessionUser && !currentSessionUser.id) return showModal(<LoginModal />)

        await callback();
    };

    useLayoutEffect(() => {
        if (currentSessionUser && currentSessionUser.id) {

            initiallyBooleanValues.current = {
                read: false
            };
        }
    }, [currentSessionUser]);

    return (
        <>
            <div
                className={`
                    flex flex-col relative justify-between space-x-3 border-y border-gray-100 p-5 
                    hover:shadow-lg dark:border-gray-800 dark:hover:bg-[#000000] rounded-sm 
                    p-2 hover:shadow-lg dark:border-gray-800 dark:hover:bg-[#0e1517] rounded-sm
                    w-full
                    h-[12.5rem]
                    cursor-pointer
                `}
            >
                {/* On click handler on button below */}
                <button 
                    type="button" 
                    className="absolute m-0 inset-0 w-full h-full bg-transparent z-10"
                    onClick={onClick}
                ></button>
                <div className="flex flex-col justify-between h-full space-x-3 cursor-pointer">
                    {messageHistoryItem.receiverProfileImage && (
                        <img
                            className="h-10 w-10 rounded-full object-cover "
                            src={messageHistoryItem.receiverProfileImage}
                            alt={messageHistoryItem.receiverUsername}
                        />
                    )}
                    <div className="flex flex-col justify-between item-center space-x-1">
                        <p className='text-sm'>
                            {messageHistoryItem.receiverUsername}
                        </p>
                        <p className='text-md'>
                            {messageHistoryItem.messageCount} Messages
                        </p>
                        {messageHistoryItem.lastMessageDate && (
                            <div>
                                <p className='text-gray-900 bold'>Last Messaged At:</p>
                                <TimeAgo
                                    className="text-sm text-gray-500 dark:text-gray-400"
                                    date={convertDateToDisplay(messageHistoryItem.lastMessageDate)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default MessageHistoryItemComponent;
