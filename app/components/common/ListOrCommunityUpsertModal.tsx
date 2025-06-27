import { ModalBody, ModalPortal } from "@components/Modal";
import { faker } from "@faker-js/faker";
import { FilterKeys, useStore } from "@stores/index";
import { FieldHelperProps, Formik, FormikErrors } from "formik";
import { motion } from "framer-motion";
import { PagingParams } from "models/common";
import { signIn, useSession } from "next-auth/react";
import { useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { CommonUpsertBoxTypes, CommunityRecord, ListRecord } from "typings.d";
import { observer } from "mobx-react-lite";
import { ListOrCommunityFormInputs } from "./ListOrCommunityForm";
import UsersFeed from "@components/UsersFeed";


interface Props {
    type: CommonUpsertBoxTypes;
}

function ListOrCommunityUpsertModal({ type }: Props) {
    const { data: session } = useSession();
    const { user } = session ?? {};
    const userId = useMemo(() => user ? (user as any)["id"] : "", [session]);
    const toastMessage = useMemo(() => type === CommonUpsertBoxTypes.List ? 'New List Created' : 'New Community Found', [type]);

    const { modalStore, communityFeedStore, listFeedStore, searchStore } = useStore();
    const { closeModal } = modalStore;

    const currentStep = useMemo(() => {
        if (type === CommonUpsertBoxTypes.Community) return (communityFeedStore.currentStepInCommunityCreation ?? 0);
        else return (listFeedStore.currentStepInListCreation ?? 0);
    }, [type, communityFeedStore.currentStepInCommunityCreation, listFeedStore.currentStepInListCreation]);

    const setCurrentStep = useCallback((val: number) => {
        if (type === CommonUpsertBoxTypes.Community) return communityFeedStore.setCurrentStepInCommunityCreation(val);
        else return listFeedStore.setCurrentStepInListCreation(val);
    }, [type]);



    const feedLoadingInitial = useMemo(() =>
        type === CommonUpsertBoxTypes.Community ? communityFeedStore.loadingInitial : listFeedStore.loadingInitial,
        [
            communityFeedStore.setLoadingInitial,
            listFeedStore.setLoadingInitial
        ]);
    const resetPagingParams = useCallback(() => {
        if (type === CommonUpsertBoxTypes.Community)
            communityFeedStore.setPagingParams(new PagingParams(1, 10));
        else
            listFeedStore.setPagingParams(new PagingParams(1, 10));
    }, [type]);
    const upsert: (form: any, userId: string) => Promise<void> = useCallback(
        type === CommonUpsertBoxTypes.Community ? communityFeedStore.addCommunity : listFeedStore.addList,
        [type]
    );
    const loadListsOrCommunities = useMemo(
        () => {
            if (type === CommonUpsertBoxTypes.Community) return communityFeedStore.loadCommunities;
            else return listFeedStore.loadLists;
        },
        [type]
    );
    const postRecord = async (values: any) => {
        let infoToUpsert: ListRecord | CommunityRecord | undefined;

        if (type === CommonUpsertBoxTypes.Community)
            infoToUpsert = {
                id: `community_${faker.datatype.uuid()}`,
                userId,
                name: values.name,
                avatar: values.avatar,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                _rev: '',
                _type: "community",
                isPrivate: (values.isPrivate === 'private'),
                tags: values.tags
            } as CommunityRecord
        else if (type === CommonUpsertBoxTypes.List)
            infoToUpsert = {
                id: `list_${faker.datatype.uuid()}`,
                userId,
                name: values.name,
                avatar: "",
                bannerImage: values.bannerImage,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                _rev: "",
                _type: "list"
            } as ListRecord

        await upsert(infoToUpsert, userId)

        resetPagingParams();

        await loadListsOrCommunities(userId);

        toast(toastMessage, {
            icon: "🚀",
        });
    };

    return (
        <ModalPortal>
            <ModalBody onClose={() => closeModal()}>
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex space-x-2 p-5"
                >
                    {/* <div className="flex flex-1 item-center pl-2"> */}
                    <Formik
                        initialValues={{
                            name: '',
                            avatar: '',
                            isPrivate: false,
                            tags: [],
                            usersAdded: []
                        }}
                        validate={values => {
                            const errors: FormikErrors<any> = {};
                            if (!values.name) {
                                errors.name = 'Name is required';
                            } else if (!values.avatar) {
                                errors.avatar = 'Community avatar is required'
                            } else if (!values.isPrivate) {
                                errors.isPrivate = 'Is Private is required'
                            } else if (!values.tags || !values.tags.length) {
                                errors.tags = 'Tags is required'
                            }

                            return errors;
                        }}
                        onSubmit={async (values, { setSubmitting }) => {
                            await postRecord(values);
                            setSubmitting(false);
                            closeModal();
                        }}
                    >
                        {({
                            values,
                            errors,
                            handleSubmit,
                            isSubmitting,
                            /* and other goodies */
                        }) => (
                            <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
                                {currentStep === 0 && (
                                    <ListOrCommunityFormInputs type={type} />
                                )}
                                {currentStep === 1 && (
                                    <UsersFeed 
                                        title="Users to Add"
                                        filterKey={FilterKeys.SearchUsers}
                                        usersAlreadyAddedOrFollowedByIds={values.usersAdded}
                                    />
                                )}
                                <div className="flex items-center mt-2 space-x-2">
                                    {currentStep > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(currentStep === 0 ? 0 : currentStep - 1)}
                                            className="rounded-full bg-gray-200 px-5 py-2 font-bold text-gray-700"
                                        >
                                            Back
                                        </button>
                                    )}

                                    {currentStep < 1 ? (
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(currentStep === 1 ? 1 : currentStep + 1)}
                                            disabled={Object.values(errors).some(v => !!v)}
                                            className={`rounded-full bg-maydan px-5 py-2 font-bold text-white disabled:opacity-40`}
                                        >
                                            Next
                                        </button>
                                    ) : (
                                        <button
                                            type='submit'
                                            disabled={Object.values(errors).some(v => !!v) || feedLoadingInitial}
                                            className={`rounded-full bg-maydan px-5 py-2 font-bold text-white disabled:opacity-40`}
                                        >
                                            {feedLoadingInitial ? (
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
                                                'Submit'
                                            )}
                                        </button>
                                    )}
                                </div>
                            </form>
                        )}
                    </Formik>
                </motion.div>

            </ModalBody>
        </ModalPortal>
    );
}

export default observer(ListOrCommunityUpsertModal);