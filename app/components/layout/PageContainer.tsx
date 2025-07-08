"use client";
import React, { useLayoutEffect, useMemo, useRef } from "react";
import SideBar from "./SideBar";
import Widgets from "./Widgets";
import { useStore } from "@stores/index";
import { observer } from "mobx-react-lite";
import {  RegisterModal } from "../common/AuthModals";
import { leadingDebounce } from "@utils/common";
import { getSession, useSession } from "next-auth/react";
import { useCheckSession } from "hooks/useCheckSession";

type PageContainerProps = {
  title?: string;
};


const PageContainer = ({
  children,
}: React.PropsWithChildren<PageContainerProps>) => {
  const { data:session } = useSession();
  const { authStore, modalStore } = useStore();
  const { currentSessionUser } = authStore;
  const { 
    completeRegistrationModalShown,
    modalToShow, 
    setCompleteRegistrationModalShown,
    showModal, 
  } = modalStore;
  const retryCount = useRef(0);

  useLayoutEffect(() => {
    
    if(currentSessionUser && !currentSessionUser.isCompleted && !completeRegistrationModalShown)
      leadingDebounce(() => {
        setCompleteRegistrationModalShown(true)
        showModal(<RegisterModal userInfo={currentSessionUser!} />);
      }, 15000);

    retryCount.current += 1;

    return () => {
      retryCount.current = 0;
    }
  }, [currentSessionUser])

  return (
    <>
      <SideBar />
      <div className="col-span-7 lg:col-span-7">
        {children ? children : null}
      </div>
      <Widgets />
      {modalToShow && modalToShow}
    </>
  );
};
export default observer(PageContainer);
