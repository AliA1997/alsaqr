import { NoRecordsTitle } from '@components/common/Titles';
import UpsertBoxIconButton from '@components/common/UpsertBoxIconButtons';
import { XIcon } from '@heroicons/react/outline';
import { ArrowLeftIcon } from '@heroicons/react/solid';
import agent from '@utils/common';
import { communityApiClient } from '@utils/communityApiClient';
import { convertDateToDisplay } from '@utils/neo4j/neo4j';
import { motion } from 'framer-motion';
import { Pagination } from 'models/common';
import { CommunityDiscussionAdminInfo, CommunityDiscussionInfoForMessageRoom, CommunityDiscussionMessageDto, CommunityDiscussionMessageToDisplay } from 'models/community';
import { User } from 'next-auth';
import { useState, useEffect, useRef, useMemo } from 'react';
import NextImage from 'next/image';
import TimeAgo from "react-timeago";
import CustomPageLoader, { ButtonLoader } from '@components/common/CustomLoader';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import CommunityDiscussionAdminView from './CommunityDiscussionAdminView';

type Props = {
  loggedInUser: User;
  communityId: string;
  communityDiscussionId: string;
}

const CommunityDiscussionMessageRoom = ({
  loggedInUser,
  communityId,
  communityDiscussionId
}: Props) => {
    const router = useRouter();

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(true);
  const [loadingAdminInfo, setLoadingAdminInfo] = useState<boolean>(false);
  const [commmityDiscussionInfo, setCommunityDiscussionInfo] = useState<CommunityDiscussionInfoForMessageRoom | undefined>(undefined);
  const [adminCommunityDiscussionInfo, setAdminCommunityDiscussionInfo] = useState<CommunityDiscussionAdminInfo | undefined>(undefined);
  const userId = useMemo(() => loggedInUser?.id, [loggedInUser]);

  useEffect(() => {
    async function getCommunityDiscussionInfo() {
      const result = await agent.communityApiClient.getCommunityDiscussionForMessageRoom(userId, communityId, communityDiscussionId);

      setCommunityDiscussionInfo(result);
    }
    async function getAdminCommunityDiscussionInfo() {
      const result = await agent.communityApiClient.getAdminCommunityDiscussionInfo(userId, communityId, communityDiscussionId);

      setAdminCommunityDiscussionInfo(result);
    }

    if (communityDiscussionId && communityId) {
      getCommunityDiscussionInfo();
      getAdminCommunityDiscussionInfo();
    }
  }, [
    communityDiscussionId,
    communityId
  ])

  useEffect(() => {
    if (communityDiscussionId && communityId)
      getDiscussionMessages(1, 100)
  }, [
    communityId,
    communityDiscussionId,
    (submitting === false)
  ])

  const [messages, setMessages] = useState<CommunityDiscussionMessageToDisplay[]>();
  const [pagination, setPagination] = useState<Pagination | undefined>(undefined);
  const [input, setInput] = useState('');
  const [image, setImage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  async function getDiscussionMessages(currentPage?: number, itemsPerPage?: number) {
    setLoadingMessages(true);
    const urlParams = new URLSearchParams();
    urlParams.append('itemsPerPage', itemsPerPage?.toString() ?? '100');
    urlParams.append('currentPage', currentPage?.toString() ?? '1');
    try {
      const { result } = await communityApiClient.getCommunityDiscussionMessages(
        urlParams,
        loggedInUser.id,
        communityId,
        communityDiscussionId
      );

      setMessages(result.data);
      setPagination(result.pagination);
    } finally {
      setLoadingMessages(false);
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (!input.trim()) return;

    const message: CommunityDiscussionMessageDto = {
      userId: loggedInUser.id,
      communityDiscussionId: communityDiscussionId,
      communityId: communityId,
      messageText: input,
      image: image,
      _type: "community_discussion_message",
      tags: []
    };

    try {
      await communityApiClient.addCommunityDiscussionMessage(
        message,
        loggedInUser.id,
        message.communityId,
        message.communityDiscussionId
      );
      setInput('');
      setImage('');

      toast("Discussion Message Posted!", {
        icon: "🚀",
      });

      await getDiscussionMessages(1, 100);
    }
    finally {
      setSubmitting(false);
    }
  };
  async function refreshCommunityDiscussionInfo(communityId: string) {
      const communityDiscussionInfoResult = await communityApiClient
        .getAdminCommunityDiscussionInfo(loggedInUser.id, communityId, communityDiscussionId);
  
      setCommunityDiscussionInfo(communityDiscussionInfoResult);
      setLoadingAdminInfo(false);
  }
  

  const communityDiscussionUsers = useMemo(() => {
    const jUsers = commmityDiscussionInfo?.joinedUsers ?? [];
    const iUsers = commmityDiscussionInfo?.invitedUsers ?? [];

    return Array.from(new Set([...jUsers, ...iUsers]).values())
  }, [commmityDiscussionInfo])

  console.log("JSON.stringiy:", JSON.stringify(adminCommunityDiscussionInfo))
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-[#0e1517]">
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-200 dark:border-gray-900 flex items-center dark:bg-[#0e1517]">
        <button
          type='button'
          className="text-white rounded-full p-2 focus:outline-none h-10 w-10"
          onClick={() => router.back()}
        >
          <ArrowLeftIcon />
        </button>
        <div className="flex space-x-2">
          {
            communityDiscussionUsers.map(user => (
              <img
                key={user.id}
                src={user.avatar}
                alt={user.username}
                className="w-10 h-10 rounded-full border-2 border-white dark:border-none"
              />
            ))}
        </div>
        <div className="ml-3">
          <h2 className="font-semibold text-gray-800 dark:text-gray-50">{commmityDiscussionInfo?.communityDiscussion.name}</h2>
          <p className="text-xs text-gray-500">
            {/* {users.filter(user => user.isOnline).length} online  - V2 feature possibly */}
          </p>
        </div>
      </div>
      {adminCommunityDiscussionInfo?.isFounder && (
        <CommunityDiscussionAdminView
          communityDiscussionAdminInfo={adminCommunityDiscussionInfo}
          refreshCommunityDiscussionAdminInfo={refreshCommunityDiscussionInfo} 
        />
      )}
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loadingMessages ? (
          <CustomPageLoader title="Loading" />
        ) : (
          <>
            {messages && messages.length
              ? messages.map((message) => (
                <div
                  key={message.communityDiscussionMessage.id}
                  className={`flex ${message.communityDiscussionMessage.userId === loggedInUser.id ? 'justify-end' : 'justify-start'}`}
                >
                  {!(message.communityDiscussionMessage.userId === loggedInUser.id) && (
                    <img
                      src={message.profileImg}
                      alt={message.username}
                      className="w-8 h-8 rounded-full mr-2 mt-1"
                    />
                  )}
                  <div className={`max-w-xs md:max-w-md lg:max-w-lg ${(message.communityDiscussionMessage.userId === loggedInUser.id) ? 'flex flex-col items-end' : ''}`}>
                    {!(message.communityDiscussionMessage.userId === loggedInUser.id) && (
                      <span className="text-xs font-medium text-gray-700 mb-1">
                        {message.username}
                      </span>
                    )}
                    <div
                      className={`p-3 rounded-lg ${(message.communityDiscussionMessage.userId === loggedInUser.id) ? 'bg-blue-500 text-white' : 'bg-maydan text-white'}`}
                    >
                      <p>{message.communityDiscussionMessage.messageText}</p>
                      {message.communityDiscussionMessage.image && (
                        <img
                          src={message.communityDiscussionMessage.image}
                          alt="img/tweet"
                          className="m-5 ml-0 max-h-60 rounded-lg object-cover shadow-sm"
                        />
                      )}
                    </div>
                    <TimeAgo
                      className="text-sm text-gray-500"
                      date={convertDateToDisplay(message.communityDiscussionMessage)}
                    />
                  </div>
                </div>
              ))
              : <NoRecordsTitle>No Discussion Messages to Display</NoRecordsTitle>}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white p-4 border-t border-gray-200 dark:border-none dark:bg-[#0e1517]">
        <form onSubmit={handleSendMessage} className="flex flex-col items-start">
          {image && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className='relative'
            >
              <button
                onClick={() => setImage("")} // Replace with your close logic
                className="absolute left-2 top-2 z-10 rounded-full bg-red-800 p-2 text-white hover:bg-red-700 focus:outline-none"
                aria-label="Close"
              >
                <XIcon className="h-5 w-5" />
              </button>
              <NextImage
                className="mt-10 h-40 w-full rounded-xl object-contain shadow-lg"
                src={image}
                width={20}
                height={20}
                alt="image/tweet"
              />
            </motion.div>
          )}
          <div className='flex w-full'>
            <input
              type="text"
              className={`
                flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                dark:bg-gray-900  
              `}
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="ml-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={!input.trim() || submitting}
            >
              {submitting ? (
                <ButtonLoader />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
          <div className='px-1'>
            <UpsertBoxIconButton setInput={setInput} input={input} setImage={setImage} />
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunityDiscussionMessageRoom;