"use client";
import React from "react";
import SideBar from "./SideBar";
import Widgets from "./Widgets";
import { ModalBody, ModalPortal } from "./Modal";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useStore } from "@stores/index";
import { observer } from "mobx-react-lite";

type PageContainerProps = {
  title?: string;
};

const PageContainer = ({
  children,
}: React.PropsWithChildren<PageContainerProps>) => {
  const { modalStore } = useStore();
  const { toggleLoginModal, showLoginModal } = modalStore;

  const handleGoogleSignIn = () => signIn("google");

  return (
    <>
      <SideBar />
      <div className="col-span-7 lg:col-span-5">
        {children ? children : null}
      </div>
      <Widgets />
      {showLoginModal && (
        <ModalPortal>
          <ModalBody onClose={() => toggleLoginModal(false)}>
            <button
              className={`
                flex items-center p-3 border rounded-lg font-medium 
                text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-800
                dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white
              `}
              onClick={handleGoogleSignIn}
            >
              <Image
                src="/google-icon.svg"
                height={20}
                width={20}
                alt="Google Social Button Icon"
                className="mr-2"
              />
              Sign in with Google
            </button>
          </ModalBody>
        </ModalPortal>
      )}
    </>
  );
};
export default observer(PageContainer);
