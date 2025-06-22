"use client";
// components/Modal.tsx
import React from 'react';
import { createPortal } from 'react-dom';

interface ModalBodyProps {
  // isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalBody = ({ onClose, children }: ModalBodyProps) => {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-[#000000] rounded-lg shadow-lg w-11/12 max-w-lg mx-auto">
        <div className="relative p-4">
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

export {ModalBody, ModalPortal};
