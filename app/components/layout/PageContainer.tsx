"use client";
import React, { useLayoutEffect, useRef } from "react";
import SideBar from "./SideBar";
import Widgets from "./Widgets";
import { useStore } from "@stores/index";
import { observer } from "mobx-react-lite";
import { LoginModal, RegisterModal } from "../common/AuthModals";
import { useRouter } from "next/router";
import { ROUTES_USER_CANT_ACCESS } from "@utils/constants";

type PageContainerProps = {
  title?: string;
};


const PageContainer = ({
  children,
}: React.PropsWithChildren<PageContainerProps>) => {
  const { authStore, modalStore } = useStore();
  const { currentSessionUser } = authStore;
  const { closeModal, modalToShow, showModal } = modalStore;
  const retryCount = useRef(0);

  useLayoutEffect(() => {
    
    if(currentSessionUser && !currentSessionUser.isCompleted && retryCount.current > 1)
      showModal(<RegisterModal userInfo={currentSessionUser!} />);
    else
      closeModal();

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
