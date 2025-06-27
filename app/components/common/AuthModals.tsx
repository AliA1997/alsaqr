import { ModalBody, ModalPortal } from "@components/Modal";
import { useStore } from "@stores/index";
import { signIn } from "next-auth/react";
import Image from "next/image";


export function LoginModal() {
    const { modalStore } = useStore();
    const { closeModal } = modalStore;
    const handleGoogleSignIn = () => signIn("google");
    return (
        <ModalPortal>
          <ModalBody onClose={() => closeModal()}>
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
    );
}