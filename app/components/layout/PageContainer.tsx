"use client";
import React, { useLayoutEffect, useRef } from "react";
import SideBar from "./SideBar";
import Widgets from "./Widgets";
import { useStore } from "@stores/index";
import { observer } from "mobx-react-lite";
import { useSession } from "next-auth/react";
import { LoginModal, RegisterModal } from "../common/AuthModals";
import { useRouter } from "next/router";
import { ROUTES_USER_CANT_ACCESS } from "@utils/constants";

type PageContainerProps = {
  title?: string;
};


const PageContainer = ({
  children,
}: React.PropsWithChildren<PageContainerProps>) => {
  const { modalStore } = useStore();
  const { closeModal, modalToShow, showModal } = modalStore;
  const { data:session } = useSession();
  const retryCount = useRef(0);

  useLayoutEffect(() => {
    
    if(session && session.user && !session.user.isCompleted && retryCount.current > 2)
      showModal(<RegisterModal userInfo={session?.user!} />);
    else
    closeModal();

    retryCount.current += 1;

    return () => {
      retryCount.current = 0;
    }
  }, [session])

  return (
    <>
      <SideBar />
      <div className="col-span-7 lg:col-span-5">
        {children ? children : null}
      </div>
      <Widgets />
      {modalToShow && modalToShow}
    </>
  );
};
export default observer(PageContainer);
