"use client";
import { NoRecordsTitle } from "@components/common/Titles";
import { getSession } from "next-auth/react";
import { useStore } from "@stores/index";
import { ModalLoader } from "@components/common/CustomLoader";
import { MessageFormDto, MessageHistoryToDisplay, MessageType, User } from "typings.d";
import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import MessageHeader from "@components/message/MessageHeader";
import MessageContent from "@components/message/MessageContent";
import MessageInput from "@components/message/MessageInput";
import toast from "react-hot-toast";
import MessageHistoryItemComponent from "@components/message/MessageHistoryItem";
import { useGetMounted } from "hooks/useGetMounted";

export default observer(() => {
  const { authStore, messageStore } = useStore();
  const isMounted = useRef(false);
      
  const { currentSessionUser } = authStore;
  const { 
    setSelectedDirectMessageHistoryItem,
    selectedDirectMessageHistoryItem,
    loadDirectMessageHistory, 
    loadDirectMessages,
    loadingInitial,
    loadingHistory,
    loadingUpsert,
    directMessageHistory,
    directMessageHistoryRegistry,
    directMessages,
    sendDirectMessage
  } = messageStore;
  const [input, setInput] = useState<string>('');
  const [image, setImage] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  async function loadDirectMessageHistoryItems(userId: string) {
    await loadDirectMessageHistory(userId)
    isMounted.current = true;
  }

  async function loadDirectMessageItems(dHistItem: MessageHistoryToDisplay) {
    setSelectedDirectMessageHistoryItem(dHistItem);
    await loadDirectMessages(currentSessionUser?.id!, dHistItem.receiverId!)
  }

  useEffect(() => {
    if(currentSessionUser && currentSessionUser.id)
      loadDirectMessageHistoryItems(currentSessionUser.id);

    return () => {
      isMounted.current = false;
    };
  }, [currentSessionUser]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        if (!input.trim()) return;

        const messageForm: MessageFormDto = {
          senderId: currentSessionUser?.id!,
          senderUsername: currentSessionUser?.username,
          senderProfileImg: currentSessionUser?.avatar,
          recipientId: selectedDirectMessageHistoryItem?.receiverId,
          recipientUsername: selectedDirectMessageHistoryItem?.receiverUsername,
          recipientProfileImg: selectedDirectMessageHistoryItem?.receiverProfileImage,
          image: image,
          text: input,
          messageType: MessageType.Direct
        };

        try {
            
            await sendDirectMessage(messageForm, currentSessionUser?.id!);

            setInput('');
            setImage('');

            toast("Message Posted!", {
              icon: "🚀",
            });

            await loadDirectMessages(messageForm.senderId, messageForm.recipientId!);
        }
        finally {
            setSubmitting(false);
        }
    };
  
  return (
    <div className="flex h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100">
      {/* Left Sidebar - Message List */}
      <div className="hidden md:flex w-auto border-r border-gray-200 dark:border-gray-800 flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Messages</h1>
            <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </button>
          </div>
          
          <div className="relative mt-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search Direct Messages"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className={`flex-1 ${loadingHistory ? 'text-center' : ''} overflow-y-auto`}>
          {/* Message list items would go here */}
          {loadingHistory && !isMounted.current ? (
            <div className='p-3'>
              <ModalLoader />
            </div>
          ) : directMessageHistory && directMessageHistory.length
            ? directMessageHistory.map((dHistItem, idx) => (
              <MessageHistoryItemComponent
                key={dHistItem.receiverId ??  idx}
                messageHistoryItem={dHistItem}
                onClick={async () => {
                  await loadDirectMessageItems(dHistItem);
                }}
              />
            )) 
            : <NoRecordsTitle>Search a user to message</NoRecordsTitle>
          }
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        
        {/* Empty State - Using your NoRecordsTitle component */}
        {/* <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full mb-4 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <NoRecordsTitle>You have no messages!</NoRecordsTitle>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            When you send or receive messages, they'll appear here.
          </p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full">
            Write a message
          </button>
        </div> */}
        
        {/* Conversation View (commented out for now) */}
        
        <div className="flex-1 flex flex-col">
          <MessageHeader
            sessionUser={currentSessionUser}
            userToMessageId={selectedDirectMessageHistoryItem?.receiverId ?? ''}
            userToMessageUsername={selectedDirectMessageHistoryItem?.receiverUsername ?? ''}
            userToMessageAvatar={selectedDirectMessageHistoryItem?.receiverProfileImage ?? ''}
            onGoBack={() => setSelectedDirectMessageHistoryItem(undefined)}
          />

          <MessageContent
            loggedInUserId={currentSessionUser?.id}
            loading={loadingInitial}
            showMessages={!!(selectedDirectMessageHistoryItem && directMessages && directMessages.length)}
            messages={directMessages}
            noRecordsText="No direct messages to show"
          />

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
       
      </div>
    </div>
  );
});