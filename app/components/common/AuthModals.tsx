import { ModalBody, ModalPortal } from "@components/Modal";
import { useStore } from "@stores/index";
import { ROUTES_USER_CANT_ACCESS } from "@utils/constants";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";


export function LoginModal() {
    const { modalStore } = useStore();
    const { closeModal } = modalStore;
    const handleGoogleSignIn = () => signIn("google");
    const { data:session } = useSession();
    
    return (
        <ModalPortal>
          <ModalBody onClose={() => {
            const canCloseLoginModal = !(ROUTES_USER_CANT_ACCESS.some(r => window.location.href.includes(r)));
            if((!session || !session!.user) && canCloseLoginModal)
              closeModal();
            
          }}>
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