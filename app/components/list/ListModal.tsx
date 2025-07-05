import { ModalBody, ModalPortal } from "@components/common/Modal";
import { Select } from "@components/common/Select";
import PostComponent from "@components/posts/Post";
import UserItemComponent from "@components/users/UserItem";
import { FilterKeys, useStore } from "@stores/index";
import { ROUTES_USER_CANT_ACCESS } from "@utils/constants";
import { Formik, FormikErrors } from "formik";
import { motion } from "framer-motion";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { ListRecord, PostToDisplay, UserItemToDisplay } from "typings";

interface SaveToListModalProps {
    relatedEntityType: "post" | "user" | "community" | "list";
    info: PostToDisplay | UserItemToDisplay;
    onClose: () => void;
    listInfo?: ListRecord;
}


export const SaveToListModal = observer(({
    relatedEntityType,
    info,
    onClose,
    listInfo
}: SaveToListModalProps) => {
    const { authStore, listFeedStore, modalStore } = useStore();
    const { currentSessionUser } = authStore;
    const {
        loadLists,
        lists,
        savePostToList,
        saveUserToList,
        loadingUpsert
    } = listFeedStore;
    const { closeModal } = modalStore;

    async function loadListData() {
        await loadLists(currentSessionUser?.id!);
    }

    async function saveItemToList(listId: string) {
        let castedRecord: PostToDisplay | UserItemToDisplay;
        if (relatedEntityType === "post") {
            castedRecord = info as PostToDisplay;
         
            await savePostToList(castedRecord.post.id, currentSessionUser?.id!, listId);
        }
        if (relatedEntityType === "user") {
            castedRecord = info as UserItemToDisplay;

            await saveUserToList(castedRecord.user.id, currentSessionUser?.id!, listId);
        }
    }

    useEffect(() => {
        if (currentSessionUser)
            loadListData()
    }, [currentSessionUser])

    const listOptions = useMemo(() => lists.map(list => ({
        value: list.list.id,
        label: list.list.name
    })), [lists])

    return (
        <ModalPortal>
            <ModalBody onClose={onClose}>
                <>
                    <div className='flex flex-col px-1'>
                        {(() => {
                            if (relatedEntityType === 'post')
                                return (
                                    <>
                                        <h2>Post to Save: </h2>
                                        <PostComponent
                                            postToDisplay={info as PostToDisplay}
                                            onlyDisplay={true}
                                        />
                                    </>
                                );
                            else if (relatedEntityType === "user")
                                return (
                                    <>
                                        <h2>User to Save: </h2>
                                        <UserItemComponent
                                            filterKey={FilterKeys.Lists}
                                            userItemToDisplay={info as UserItemToDisplay}
                                            usersAlreadyFollowedOrAddedIds={[]}
                                            canAddOrFollow={false}
                                            onModal={true}
                                        />
                                    </>
                                );
                        })()}
                    </div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="flex space-x-2 p-5"
                    >
                        {/* <div className="flex flex-1 item-center pl-2"> */}
                        <Formik
                            initialValues={{ listToSaveTo: undefined }}
                            validate={values => {
                                const errors: FormikErrors<any> = {};

                                return errors;
                            }}
                            onSubmit={async (values, { setSubmitting }) => {
                                await saveItemToList(values.listToSaveTo!);
                                setSubmitting(false);
                                closeModal();
                            }}
                        >
                            {({
                                values,
                                errors,
                                handleSubmit,
                                /* and other goodies */
                            }) => (
                                <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
                                    <Select
                                        name="listToSaveTo"
                                        label="List to Save To:"
                                        placeholder="Select a List to Save to"
                                        value={values.listToSaveTo}
                                        options={listOptions}
                                        className="mb-2 h-8 text-md"
                                    />
                                    <button
                                        disabled={loadingUpsert}
                                        className={`
                                            rounded-full bg-maydan px-5 py-2 font-bold text-white
                                            disabled:opacity-40
                                            cursor-pointer
                                        `}
                                        type="submit"
                                    >
                                        {loadingUpsert ? (
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
                                        ) : (<>Save to List</>)}
                                    </button>
                                </form>
                            )}
                        </Formik>
                    </motion.div>
                </>
            </ModalBody>
        </ModalPortal>
    );
});