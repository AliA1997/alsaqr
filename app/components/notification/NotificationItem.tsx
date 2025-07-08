"use client";
import { useRouter } from "next/navigation";
import React, {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {  NotificationToDisplay } from "../../../typings";
import dynamic from 'next/dynamic';
import TimeAgo from "react-timeago";
import { useStore } from "@stores/index";
const LoginModal = dynamic(() => import("../common/AuthModals").then(mod => mod.LoginModal), { ssr: false })
import { convertDateToDisplay } from "@utils/neo4j/neo4j";

interface Props {
  notificationToDisplay: NotificationToDisplay;
}

function NotificationItemComponent({
  notificationToDisplay,
}: Props) {
  const { authStore, modalStore } = useStore();
  const { currentSessionUser } = authStore;
  const router = useRouter();
  const { showModal } = modalStore;

  const [isRead, setIsRead] = useState<boolean>(false);

  const initiallyBooleanValues = useRef<{
    read: boolean;
  }>({
    read: false,
  });

  const notificationInfo = notificationToDisplay.notification;

  const checkUserIsLoggedInBeforeUpdatingTweet = async (
    callback: () => Promise<void>
  ) => {
    if (currentSessionUser?.id) return showModal(<LoginModal />)

    await callback();
  };

  useLayoutEffect(() => {
    if (currentSessionUser?.id) {

      initiallyBooleanValues.current = {
        read: false
      };
    }
  }, [currentSessionUser]);

  const onIsAlreadyRead = async () => {
    const beforeUpdate = isRead;
    try {
      await checkUserIsLoggedInBeforeUpdatingTweet(async () => {
        // setIsJoined(!isJoined);
      });
    } catch {
    //   setIsJoined(beforeUpdate);
    }
  };

  const navigateToNotification = () => {
    if(notificationInfo.notificationType.toString().includes('post'))
        router.push(notificationInfo.link ?? `/status/${notificationInfo.relatedEntityId}`);
  }

  return (
    <>
      <div
        className={`
          flex flex-col relative justify-between space-x-3 border-y border-gray-100 p-5 
          hover:shadow-lg dark:border-gray-800 dark:hover:bg-[#000000] rounded-full 
          p-2 hover:shadow-lg dark:border-gray-800 dark:hover:bg-[#0e1517] rounded-full
          w-full
          h-[5em]
          cursor-pointer
        `}
        onClick={navigateToNotification}
      >
        <div className="absolute m-0 inset-0"></div>
        <div className="flex flex-col justify-between h-full space-x-3 cursor-pointer">
        {notificationInfo.image && (
            <img
                className="h-10 w-10 rounded-full object-cover "
                src={notificationInfo.image}
                alt={notificationInfo.message}
            />
        )}
          <div className="flex justify-between item-center space-x-1">
            <p className='text-sm'>
              {notificationInfo.message}
            </p>
            {notificationInfo.createdAt && (
              <TimeAgo
                className="text-sm text-gray-500 dark:text-gray-400"
                date={convertDateToDisplay(notificationInfo.createdAt)}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default NotificationItemComponent;
