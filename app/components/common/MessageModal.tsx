"use client";
import { NoRecordsTitle } from '@components/common/Titles';
import { convertDateToDisplay } from '@utils/neo4j/neo4j';
import { useState, useEffect, useRef, useMemo } from 'react';
import TimeAgo from "react-timeago";
import CustomPageLoader from '@components/common/CustomLoader';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { MessageFormDto, MessageType, User } from 'typings.d';
import { ModalBody, ModalPortal } from './Modal';
import { observer } from 'mobx-react-lite';
import { useStore } from '@stores/index';
import { MessagesImagePreview } from './Containers';
import MessageInput from '@components/message/MessageInput';

type Props = {
    loggedInUser: User;
    usersInMessageModal: User[];
}

const MessageModal = ({
    loggedInUser,
    usersInMessageModal,
}: Props) => {
    const router = useRouter();
    const { messageStore, modalStore } = useStore();
    const { closeModal } = modalStore;
    const {
        loadingUpsert,
        loadingInitial, 
        setPagingParams,
        loadDirectMessages, 
        sendDirectMessage ,
        directMessages
    } = messageStore;
    const [submitting, setSubmitting] = useState<boolean>(false);
    const userId = useMemo(() => loggedInUser?.id, [loggedInUser]);
    const sender = useMemo(() => usersInMessageModal[0], [usersInMessageModal]);
    const receiver = useMemo(() => usersInMessageModal[1], [usersInMessageModal]);

    const [input, setInput] = useState('');
    const [image, setImage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [directMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if(sender)
            loadDirectMessages(sender.id, receiver.id);
    }, [receiver])


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        if (!input.trim()) return;

        const messageForm: MessageFormDto = {
          senderId: sender.id,
          senderUsername: sender.username,
          senderProfileImg: sender.avatar,
          recipientId: receiver.id,
          recipientUsername: receiver.username,
          recipientProfileImg: receiver.avatar,
          image: image,
          text: input,
          messageType: MessageType.Direct
        };

        try {
            
            await sendDirectMessage(messageForm, loggedInUser.id);

            setInput('');
            setImage('');

              toast("Message Posted!", {
                icon: "🚀",
              });

            await loadDirectMessages(sender.id, receiver.id);
        }
        finally {
            setSubmitting(false);
        }
    };

    return (
        <ModalPortal>
            <ModalBody
                classNames=""
                onClose={() => closeModal()}
                headerChildren={
                    <div className="flex justify-between bg-transparent p-4 flex items-center dark:bg-[#0e1517]">
                        <div className="flex space-x-2">
                            {usersInMessageModal.map((user: User, index: number) => (
                                <MessagesImagePreview key={index} user={user} index={index} />
                                ))}
                        </div>
                        <div className="ml-3">
                            <h2 className="font-semibold text-gray-800 dark:text-gray-50">
                                Direct Message to {receiver.username}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {/* {users.filter(user => user.isOnline).length} online */}
                            </p>
                        </div>
                        <button
                            onClick={() => closeModal()}
                            className="text-gray-400 hover:text-gray-600 block float-right"
                        >
                            <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                            </svg>
                        </button>
                    </div>
                }
            >
                <div className="h-[90vh] flex flex-col h-screen bg-gray-50 dark:bg-[#0e1517]">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {loadingInitial ? (
                            <CustomPageLoader title="Loading" />
                        ) : (
                            <>
                                {directMessages && directMessages.length
                                    ? directMessages.map((messageToDisplay) => (
                                        <div
                                            key={messageToDisplay.message.id}
                                            className={`flex ${messageToDisplay.message.senderId === loggedInUser.id ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {!(messageToDisplay.message.senderId === loggedInUser.id) && (
                                                <img
                                                    src={messageToDisplay.message.senderProfileImg}
                                                    alt={messageToDisplay.message.senderUsername}
                                                    className="w-8 h-8 rounded-full mr-2 mt-1"
                                                />
                                            )}
                                            <div className={`max-w-xs md:max-w-md lg:max-w-lg ${(messageToDisplay.message.senderId === loggedInUser.id) ? 'flex flex-col items-end' : ''}`}>
                                                {!(messageToDisplay.message.senderId === loggedInUser.id) && (
                                                    <span className="text-xs font-medium text-gray-700 mb-1">
                                                        {messageToDisplay.message.text}
                                                    </span>
                                                )}
                                                <div
                                                    className={`p-3 rounded-lg ${(messageToDisplay.message.senderId === loggedInUser.id) ? 'bg-blue-500 text-white' : 'bg-maydan text-white'}`}
                                                >
                                                    <p>{messageToDisplay.message.text}</p>
                                                    {messageToDisplay.message.image && (
                                                        <img
                                                            src={messageToDisplay.message.image}
                                                            alt="img/tweet"
                                                            className="m-5 ml-0 max-h-60 rounded-lg object-cover shadow-sm"
                                                        />
                                                    )}
                                                </div>
                                                <TimeAgo
                                                    className="text-sm text-gray-500"
                                                    date={convertDateToDisplay(messageToDisplay.message.createdAt)}
                                                />
                                            </div>
                                        </div>
                                    ))
                                    : <NoRecordsTitle>No Messages to Display</NoRecordsTitle>}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Message Input */}
                    <MessageInput 
                        onSubmit={handleSendMessage}
                        image={image}
                        setImage={setImage}
                        input={input}
                        setInput={setInput}
                        loading={loadingUpsert}
                        submitting={submitting}
                    />
                </div>
            </ModalBody>
        </ModalPortal>
    );
};

export default observer(MessageModal);