"use client";
import { useStore } from '@stores/index';
import { observer } from 'mobx-react-lite';
// components/Modal.tsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalBodyProps {
  // isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  headerChildren?: React.ReactNode;
  classNames?: string;
}

const ModalBody = ({ onClose, headerChildren, children, classNames }: ModalBodyProps) => {

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${classNames ?? ""}`}>
      <div className="bg-white dark:bg-[#000000] rounded-lg shadow-lg w-11/12 max-w-lg mx-auto">
        <div className="relative p-4">
          {headerChildren
            ? headerChildren
            : (
              <button
                onClick={onClose}
                className="absolute right-5 top-100 text-gray-400 hover:text-gray-600 block float-right"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}

        </div>
        <div className="flex flex-col align-center justify-center p-4">
          {children}
        </div>
        {/* <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div> */}
      </div>
    </div>
  );
};

const ModalPortal = ({ children }: React.PropsWithChildren<any>) => {
  const [mounted, setMounted] = React.useState<boolean>(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted ? createPortal(children, document.body) : null;
}

interface ConfirmModalProps {
  title: string;
  confirmMessage: string;
  onClose: () => void;
  confirmFunc: () => Promise<void>;
  declineButtonText: string;
  confirmButtonClassNames: string;
  confirmButtonText: string;
}

const ConfirmModal = observer(({
  title,
  confirmMessage,
  children,
  onClose,
  confirmFunc,
  declineButtonText,
  confirmButtonClassNames,
  confirmButtonText
}: React.PropsWithChildren<ConfirmModalProps>) => {
  const { feedStore } = useStore();
  const { loadingUpsert } = feedStore;
  const [submitting, setSubmitting] = useState<boolean>(false)
  return (
  <ModalPortal>
    <ModalBody
      headerChildren={
        <h2>{title}</h2>
      }
      onClose={onClose}
    >
      <div className='flex flex-col w-full h-full'>
        {children ? children : null}
        <p>{confirmMessage}</p>
        <div className='flex px-2 justify-between'>
          <button
            onClick={onClose}
            className={`
                  rounded-full bg-gray-100 px-5 py-2 font-bold text-gray-900 
                  disabled:opacity-40
                `}
            type="button"
          >
            {declineButtonText}
          </button>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              setSubmitting(true);
              try {
                await confirmFunc();
              } finally {
                setSubmitting(false);
              }
            }}
            disabled={(submitting ?? false) || loadingUpsert}
            className={`
                  rounded-full bg-maydan px-5 py-2 font-bold text-white ${confirmButtonClassNames && confirmButtonClassNames} 
                  disabled:opacity-40
                `}
            type="button"
          >
            {loadingUpsert || (submitting ?? false) ? (
              <svg
                aria-hidden="true"
                className="inline w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-maydan"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
            ) : (
              confirmButtonText
            )}
          </button>
        </div>
      </div>
    </ModalBody>
  </ModalPortal>
)
});

export { ModalBody, ModalPortal, ConfirmModal };
