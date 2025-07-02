import React, { useCallback, useEffect, useMemo, useState } from "react";

import { faker } from "@faker-js/faker";
import { shuffle } from "lodash";
import { useRouter } from "next/navigation";
import { ProfileUser } from "typings";
import TimeAgo from "react-timeago";
import { convertDateToDisplay } from "@utils/neo4j/neo4j";
import { getSession } from "next-auth/react";
import { CommonLink } from "@components/common/Links";
import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import SidebarRow from "@components/layout/SidebarRow";
import { MailIcon, UserAddIcon } from "@heroicons/react/outline";
import { ButtonLoader } from "@components/common/CustomLoader";
import toast from "react-hot-toast";
import { Session } from "next-auth";

type UserHeaderProps = {
  currentSession: Session | undefined;
  profileInfo: ProfileUser;
  refreshProfileInfo: () => Promise<void>;
  numberOfPosts: number;
  followerCount: number;
  followingCount: number;
};
const years = [
  "2011",
  "2010",
  "2012",
  "2013",
  "2014",
  "2015",
  "2016",
  "2017",
  "2018",
  "2019",
  "2020",
  "2021",
  "2022",
  "2023",
];
const UserHeader: React.FC<UserHeaderProps> = ({
  currentSession,
  profileInfo,
  refreshProfileInfo,
  numberOfPosts,
  followerCount,
  followingCount
}) => {
  const router = useRouter();
  const { userStore, messageStore } = useStore();
  const { followUser, unFollowUser, loadingFollow } = userStore;
  const { currentProfileToMessage, setCurrentProfileToMessage } = messageStore;
  const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);


  const profileIsLoggedInUser = useMemo(() => profileInfo.user.username === (currentSession?.user?.username ?? ""), [currentSession, profileInfo]);
  const isFollowingUser = useMemo(() => currentSession?.user?.followingUsers.some((fU: any) => fU.id === profileInfo.user.id) ?? false, [profileInfo, currentSession]);
  const handleDropdownEnter = useCallback(
      () => setIsDropdownOpen(!isDropdownOpen),
      [isDropdownOpen]
    );

  const handleOnMessage = useCallback(
    () => {
      setCurrentProfileToMessage(profileInfo);
    },
    [profileInfo]
  );

  const onFollow = useCallback(async () => {
    if(isFollowingUser)
      await unFollowUser(currentSession?.user?.id, profileInfo.user.id)
    else
      await followUser(currentSession?.user?.id, profileInfo.user.id)

    await refreshProfileInfo();


    toast(isFollowingUser ? `${profileInfo.user.username} unfollowed` : `${profileInfo.user.username} followed`, {
      icon: "🚀",
    });
  }, [profileInfo, isFollowingUser]);

  return (
    <div>
      <div>
        <div className="flex justify-start">
          <div className="px-4 py-3 mx-2">
            <div
              className="text-2xl font-medium rounded-full text-blue-400  hover:text-blue-300 float-right cursor-pointer items-center"
              onClick={() => router.back()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75"
                />
              </svg>
            </div>
          </div>
          <div className="mx-2 py-2.5">
            <h2 className="mb-0 text-xl font-bold text-gray-600 dark:text-gray-200">
              {profileInfo.user.username}
            </h2>
            <p className="mb-0 w-48 text-xs text-gray-400 dark:text-gray-300">
              {numberOfPosts ?? 0} Tweets
            </p>
          </div>
        </div>

        <hr className="border-gray-800" />
      </div>
      <div>
        <div
          className="w-full bg-cover bg-no-repeat bg-center"
          style={{
            height: "200px",
            backgroundImage: `url(${profileInfo.user.bgThumbnail ?? faker.image.city()})`,
          }}
        >
        </div>
        <div className="relative p-4">
          <div className="relative flex w-full">
            <div className="flex flex-1">
              <div className='relative' style={{ marginTop: "-6rem" }}>
                <div
                  style={{ height: "9rem", width: "9rem" }}
                  className="md rounded-full relative avatar"
                >
                  <img
                    style={{ height: "9rem", width: "9rem" }}
                    className="md rounded-full relative border-4 border-gray-900"
                    src={profileInfo.user.avatar}
                    alt=""
                  />
                </div>
              </div>
            </div>
            {/* {userPName === user?.displayName && (
              <div className="flex flex-col text-right">
                <button className="justify-center max-h-max whitespace-nowrap focus:outline-none focus:ring  max-w-max border bg-transparent border-blue-500 text-blue-500 hover:border-blue-800 flex items-center hover:shadow-lg font-bold py-2 px-4 rounded-full mr-0 ml-auto">
                  Edit Profile
                </button>
              </div>
            )} */}
            <div className="absolute w-full flex justify-end top-0 right-0">
              {
                profileIsLoggedInUser
                  ? (
                    <CommonLink 
                      onClick={() => {}}
                      animatedLink={false}
                      classNames='border border-[0.1rem] hover:text-maydan'
                    >
                      Edit Profile
                    </CommonLink>
                  )
                  : (
                    <>
                      <CommonLink
                        onClick={handleOnMessage}
                        animatedLink={false}
                        classNames='border border-[0.1rem]'
                      >
                        <MailIcon className="h-6 w-6"/>
                      </CommonLink>
                      <CommonLink
                        onClick={handleDropdownEnter}
                        animatedLink={false}
                        classNames='border border-[0.1rem]'
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-9">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                        </svg>
                      </CommonLink>
                      <button
                        type='button'
                        className={`
                          rounded-full bg-maydan px-5 py-2 font-bold text-white disabled:opacity-40
                        `}
                        onClick={onFollow}
                      >
                        {
                          loadingFollow
                          ? <ButtonLoader />
                          : (
                            <>
                              {isFollowingUser ? 'Unfollow' : 'Follow'}
                            </>
                          )
                        }
                      </button>
                    </>
                  )
              }
            </div>
          </div>
          {isDropdownOpen && (
            <div className="absolute right-0 bottom-100 mt-2 w-48 rounded-md shadow-lg ring-1 bg-white dark:bg-[#000000] ring-black ring-opacity-5 z-40">
              <div
                className="py-1"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
              >
                <SidebarRow Icon={UserAddIcon} title="Add to List" />
              </div>
            </div>
          )}

          <div className="space-y-1 justify-center w-full mt-3 ml-3">
            <div>
              <h2 className="text-xl leading-6 font-bold text-gray-800 dark:text-white">
                {profileInfo.user.username}
              </h2>
              <p className="text-sm leading-5 font-medium text-gray-600 dark:text-gray-400">
                @{profileInfo.user.username}
              </p>
            </div>

            <div className="mt-3">
              <p className="text-gray-500 leading-tight mb-2 dark:text-gray-300">
                {/* Company & Employment Information Version 2 */}
                {profileInfo.user?.bio ?? ''}
              </p>
              <div className="text-gray-600 flex dark:text-gray-400">
                <span className="flex mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-black dark:text-gray-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
                    />
                  </svg>


                  {/* Put any associated domain names for version 2 */}
                </span>
                <span className="flex mr-2">
                  <span className="leading-5 ml-1">
                    {/* Joined {profileInfo.user.createdAt ? new Date(profileInfo.user.createdAt).toLocaleString('default', { month: 'long' }) : ""} */}
                    Joined{" "}
                    <TimeAgo
                      className="leading-5"
                      date={convertDateToDisplay(profileInfo.user.createdAt)}
                    />
                  </span>
                </span>
              </div>
            </div>
            <div className="pt-3 flex justify-start items-start w-full divide-x divide-gray-800 dark:divide-gray-400 divide-solid">
              <div className="text-center pr-3">
                <span className="font-bold text-gray-600 dark:text-gray-200">
                  {followingCount}{" "}
                </span>
                <span className="text-gray-600 dark:text-gray-300">
                  Following
                </span>
              </div>
              <div className="text-center px-3">
                <span className="font-bold text-gray-600 dark:text-gray-200">
                  {followerCount}{" "}
                </span>
                <span className="text-gray-600 dark:text-gray-300">
                  Followers
                </span>
              </div>
            </div>
          </div>
        </div>
        <hr className="border-gray-800" />
      </div>
    </div>
  );
};
export default observer(UserHeader);
