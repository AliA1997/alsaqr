"use client";
import React, { useLayoutEffect } from "react";
import SideBar from "./SideBar";
import Widgets from "./Widgets";
import { useStore } from "@stores/index";
import { observer } from "mobx-react-lite";
import { useSession } from "next-auth/react";
import { LoginModal } from "./common/AuthModals";
import { useRouter } from "next/router";
import { ROUTES_USER_CANT_ACCESS } from "@utils/constants";

type PageContainerProps = {
  title?: string;
};


const PageContainer = ({
  children,
}: React.PropsWithChildren<PageContainerProps>) => {
  const { modalStore } = useStore();
  const { modalToShow, showModal } = modalStore;
  const { data:session } = useSession();

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
