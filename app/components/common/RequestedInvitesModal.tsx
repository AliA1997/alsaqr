import { FilterKeys, useStore } from "@stores/index";
import { ModalBody, ModalPortal } from "./Modal";
import { User, UserItemToDisplay } from "typings.d";
import { useRef, useState } from "react";
import { ContentContainerWithRef } from "../common/Containers";
import { PageTitle } from "../common/Titles";
import UserInviteItemComponent from "@components/users/UserInviteItem";
import { observer } from "mobx-react-lite";

type Props = {
    title: string;
    invitedUsers: User[];
    filterKey: FilterKeys;
    entityInvitedToId: string;
    childEntityInviteToId?: string;
}

function RequestedInvitesModal({ 
    title,
    invitedUsers, 
    filterKey,
    entityInvitedToId,
    childEntityInviteToId
 }: Props) {
    const { modalStore, authStore } = useStore();
    const { closeModal } = modalStore;
    const containerRef = useRef<any>(null);
    const loaderRef = useRef<any>(null);

    return (
        <ModalPortal>
            <ModalBody onClose={() => closeModal()}>
            <div 
            className={`
                col-span-7 scrollbar-hide border-x z-[100] max-h-[60vh]
                lg:col-span-5 dark:border-gray-800
            `}
            >
            {title && <PageTitle>{title}</PageTitle>}

            <ContentContainerWithRef 
                classNames={`
                    text-center overflow-y-auto scrollbar-hide
                    min-h-[30vh] max-h-[40vh]
                `}
                innerRef={containerRef} 
                >
                    {/* {loading ? (
                    <ModalLoader />
                    ) : ( */}
                    <>
                        {(invitedUsers ?? []).map((invitedUser: User, invitedUserKey) => (
                            <UserInviteItemComponent
                                key={invitedUser.id ?? invitedUserKey}
                                userItemToDisplay={{user: invitedUser} as UserItemToDisplay}
                                entityInvitedToId={entityInvitedToId}
                                childEntityInviteToId={childEntityInviteToId}
                                filterKey={filterKey}
                            />
                        ))}
                    </>
                    {/* )} */}
                </ContentContainerWithRef>
            </div>

            </ModalBody>
      </ModalPortal>
    );
}

export default observer(RequestedInvitesModal);