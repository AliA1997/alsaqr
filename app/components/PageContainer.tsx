"use client";
import React from "react";
import SideBar from "./SideBar";
import Widgets from "./Widgets";
import { useStore } from "@stores/index";
import { observer } from "mobx-react-lite";

type PageContainerProps = {
  title?: string;
};

const PageContainer = ({
  children,
}: React.PropsWithChildren<PageContainerProps>) => {
  const { modalStore } = useStore();
  const { modalToShow } = modalStore;

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
