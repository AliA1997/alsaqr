"use client";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import dynamic from 'next/dynamic';
import {
  BellIcon,
  HashtagIcon,
  BookmarkIcon,
  CollectionIcon,
  DotsCircleHorizontalIcon,
  MailIcon,
  UserIcon,
  HomeIcon,
  UsersIcon,
  LoginIcon,
  LogoutIcon,
  CogIcon,
} from "@heroicons/react/outline";
const SidebarRow = dynamic(() => import('./SidebarRow'), { ssr: false })
const DarkSwitch = dynamic(() => import('./DarkSwitch'), { ssr: false })
// import SidebarRow from "./SidebarRow";
// import { auth } from "../firebase/firebase";
// import DarkSwitch from "./DarkSwitch";
import { usePathname, useRouter } from "next/navigation";
import { getEmailUsername, stopPropagationOnClick } from "@utils/neo4j/index";
import { useStore } from "@stores/index";
import { observer } from "mobx-react-lite";
const LoginModal = dynamic(() => import("../common/AuthModals").then(mod => mod.LoginModal), { ssr: false });
const RegisterModal = dynamic(() => import("../common/AuthModals").then(mod => mod.RegisterModal), { ssr: false });

import { ROUTE_TO_SHOW_SETTINGS_SIDEBAR, ROUTES_USER_CANT_ACCESS } from "@utils/constants";
import { SettingsTabs } from "models/enums";
import { useCheckSession } from "hooks/useCheckSession";
import { User } from "typings";
import { useSession } from "next-auth/react";

type SideBarProps = {};

const SideBar = ({}: SideBarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { data:session } = useSession();
  
  const [mounted, setMounted] = useState<boolean>(false);

  const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);
  const { authStore, modalStore, settingsStore } = useStore();
  const { currentSessionUser } = authStore;

  useCheckSession(authStore.setCurrentSessionUser, currentSessionUser);
  const { closeModal, showModal } = modalStore;
  const { setCurrentTabIdx } = settingsStore;
  
  const openModal = () => showModal(<LoginModal />)

  const registrationNotCompleted = useMemo(() => !(currentSessionUser?.isCompleted ?? false), [mounted, currentSessionUser])

  const handleDropdownEnter = useCallback(
    () => setIsDropdownOpen(!isDropdownOpen),
    [isDropdownOpen]
  );

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    }
  }, []);

  useLayoutEffect(() => {
    const showLoginModal = ROUTES_USER_CANT_ACCESS.some(r =>pathname.includes(r));

    if(notLoggedIn && showLoginModal) {
      showModal(<LoginModal />);
    }
      
    if(!registrationNotCompleted && currentSessionUser)
      closeModal();

  }, [currentSessionUser?.id, mounted]);

  const notLoggedIn = useMemo(() => mounted && !currentSessionUser, [currentSessionUser, mounted]);

  const hideSidebar = useMemo(() => ROUTE_TO_SHOW_SETTINGS_SIDEBAR === pathname, [pathname]);

  return (
    <>
      <div className={`
          ${hideSidebar ? 'col-span-2' : 'col-span-1 md:col-span-2'}
          flex flex-col item-center mt-2 md:mt-0 md:px-1 md:px-4 md:items-start
        `}
        onClick={() => setIsDropdownOpen(false)}
      >
        <div className="flex justify-start">
          <img
            className={`
              m-0 h-full w-full md:w-[90%] transition-all duration-200 
              sidebarLogo
              cursor-pointer
          `}
            alt=""
            style={{ maxWidth: "unset" }}
            onClick={() => router.push("/")}
          />
        </div>
        <>
              {hideSidebar 
                ? (
                  <>
                    <SidebarRow overrideOnClick={true} isShow={true} title="Personal Info" onClick={() => setCurrentTabIdx(SettingsTabs.PersonalInfo)} />
                    <SidebarRow overrideOnClick={true} isShow={true} title="Peronalize Account" onClick={() => setCurrentTabIdx(SettingsTabs.PersonalizeAccount)} />
                    <SidebarRow overrideOnClick={true} isShow={true} title="Delete Your Account" onClick={() => setCurrentTabIdx(SettingsTabs.DeleteYourAccount)} />
                  </>
                )
                : (
                  <>
                  <SidebarRow Icon={HashtagIcon} title="Explore" href="/explore" />
                  <SidebarRow
                    Icon={BellIcon}
                    title="Notifications"
                    href="/notifications"
                  />
                  <SidebarRow Icon={MailIcon} title="Messages" href="/messages" />
                  <SidebarRow Icon={BookmarkIcon} title="Bookmarks" href="/bookmarks" />
                  <SidebarRow Icon={CollectionIcon} title="Lists" href="/lists" />
                  <SidebarRow Icon={UsersIcon} title="Communities" href="/communities" />
                  <div className="relative more-container">
                    <SidebarRow
                      Icon={DotsCircleHorizontalIcon}
                      title="More"
                      onClick={handleDropdownEnter}
                    />
                    {isDropdownOpen && (
                      <div className="absolute left-0 bottom-100 mt-2 w-48 rounded-md shadow-lg ring-1 bg-white dark:bg-[#000000] ring-black ring-opacity-5 z-40">
                        <div
                          className="py-1"
                          role="menu"
                          aria-orientation="vertical"
                          aria-labelledby="options-menu"
                        >
                          {currentSessionUser ? (
                            <>
                              <SidebarRow Icon={CogIcon} title="Settings" href="/settings"/>
                              <SidebarRow Icon={LoginIcon} title="Sign Out" />
                            </>
                          ) : (
                            <SidebarRow
                              Icon={LogoutIcon}
                              title="Sign In"
                              onClick={openModal}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <DarkSwitch />
                  {currentSessionUser && currentSessionUser.id && (
                    <>
                      <hr />
                      {/* <div className="flex align-center p-2 cursor-pointer hover:opacity-75"> */}
                      <div
                        onClick={() => router.push(`/users/${currentSessionUser?.username}`)}
                        className={`
                          group flex max-w-fit
                          cursor-pointer items-center space-x-2 rounded-full px-1 md:px-4 py-1 py-3
                          transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600 mb-1 mt-1 
                        `}
                      >
                        <img
                          className="m-0 mt-3 w-full h-full md:h-14 md:w-14 rounded-full"
                          src={currentSessionUser?.avatar ?? ''}
                          alt="Avatar"
                          loading="lazy"
                        />
                        {/* <div className="flex flex-col justify-center  p-3 opacity-50 text-xs sm:text-sm lg:text-md"> */}
                        <div className="flex flex-col display-none md:display-initial hidden group-hover:text-maydan md:inline-flex text-base font-light text-xs lg:text-sm">
                          <p>{currentSessionUser?.username}</p>
                          <p>@{getEmailUsername(currentSessionUser?.username)}</p>
                        </div>
                      </div>
                    </>
                  )}
                  </>
                )}
        </>
      </div>
    </>
  );
};
export default observer(SideBar);
