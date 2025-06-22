// pages/protected.tsx
import { NoRecordsTitle } from "@components/common/Titles";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/outline";

// import { MailIcon } from '@heroicons/react/solid';

async function MessagesPage() {
  const session = await getServerSession();
  // if (!session) {
  //   return redirect("/");
  // }

  return (
    <div className="flex h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100">
      {/* Left Sidebar - Message List */}
      <div className="hidden md:flex md:w-80 lg:w-96 border-r border-gray-200 dark:border-gray-800 flex-col">
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
        
        <div className="flex-1 overflow-y-auto">
          {/* Message list items would go here */}
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center p-4 border-b border-gray-200 dark:border-gray-800">
          <button className="mr-4">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        
        {/* Empty State - Using your NoRecordsTitle component */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
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
        </div>
        
        {/* Conversation View (commented out for now) */}
        {/*
        <div className="flex-1 flex flex-col">
          <div className="border-b border-gray-200 dark:border-gray-800 p-4 flex items-center">
            <button className="md:hidden mr-4">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 mr-3"></div>
            <div>
              <h3 className="font-bold">User Name</h3>
              <p className="text-sm text-gray-500">@username</p>
            </div>
            <button className="ml-auto p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
              <EllipsisHorizontalIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            Messages would appear here
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Start a new message"
                className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="ml-2 p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full">
                <EnvelopeIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        */}
      </div>
      
      {/* Right Sidebar - Empty in messages view */}
      <div className="hidden lg:block lg:w-80 border-l border-gray-200 dark:border-gray-800 p-4">
        <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl p-6 h-full flex items-center justify-center">
          <p className="text-gray-500 text-center">Select a conversation to start chatting</p>
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;