"use client";
import { ModalBody, ModalPortal } from "@components/common/Modal";
import { useStore } from "@stores/index";
import { Formik, FormikErrors } from "formik";
import { motion } from "framer-motion";
import { PagingParams } from "models/common";
import { useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { CommonUpsertBoxTypes, CommunityAdminInfo } from "typings.d";
import { observer } from "mobx-react-lite";
import { ListOrCommunityFormInputs } from "./ListOrCommunityForm";
import { ReviewForm, ReviewUpsertListOrCommunity } from "./ReviewForm";
import Image from 'next/image';
import { UpdateCommunityForm } from "models/community";

interface Props {
    // type: CommonUpsertBoxTypes;
    loggedInUserId: string;
    communityAdminInfo: CommunityAdminInfo;
    refreshCommunityAdminInfo: (communityId: string) => Promise<void>;
}

function UpdateCommunityModal({ loggedInUserId, communityAdminInfo, refreshCommunityAdminInfo }: Props) {
    const toastMessage = useMemo(
                            () => "Community Updated",
                            []
                        );

    const { communityFeedStore, modalStore } = useStore();
    const { closeModal } = modalStore;

    const currentStep = useMemo(() => communityFeedStore.currentStepInCommunityUpdate ?? 0, [communityFeedStore.currentStepInCommunityUpdate]);
    const currentForm = useMemo(() => communityFeedStore.updateCommunityForm, [communityFeedStore.updateCommunityForm]);


    const setCurrentStep = (val: number, form: UpdateCommunityForm | undefined) => (e: any) => {
        e.preventDefault();
        communityFeedStore.setCurrentStepInCommunityUpdate(val);
        communityFeedStore.setUpdateCommunityForm(form);
    };



    const resetPagingParams = useCallback(() => {
        communityFeedStore.setPagingParams(new PagingParams(1, 10));
    }, []);
    
    const upsert: (form: UpdateCommunityForm, userId: string) => Promise<void> = useCallback(
        async (form: UpdateCommunityForm, userId: string) => {
            await communityFeedStore.updateCommunity(form, userId, communityAdminInfo.community.id);
        },
        [communityFeedStore.updateCommunityForm]
    );
    const loadingUpsert = useMemo(() => communityFeedStore.loadingUpsert, [communityFeedStore.loadingUpsert]);

    const putRecord = async (values: any) => {
        const communityToUpdate: UpdateCommunityForm | undefined = {
            id: communityAdminInfo.community.id,
            name: values.name,
            avatar: values.avatar,
            isPrivate: values.isPrivate,
            tags: values.tags
        }

        await upsert(communityToUpdate, loggedInUserId);
        resetPagingParams();

        await refreshCommunityAdminInfo(communityToUpdate.id);

        toast(toastMessage, {
            icon: "🚀",
        });
    };

    const communityDetails = useMemo(() => communityAdminInfo.community, [communityAdminInfo.community]);
    const showReviewForm = useMemo(() => currentStep === 1, [currentStep]);
    const lastStepBeforeReview = useMemo(() => 0, []);
    const reviewInfoSectionTitle = useMemo(() => "Review Community Update", []);

    console.log('loggedInUserId', loggedInUserId)
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
                            name: communityDetails.name ?? currentForm?.name ?? '',
                            avatar: communityDetails.avatar ?? currentForm?.avatar ?? '',
                            isPrivate: communityDetails?.isPrivate === true ? 'private' : 'public',
                            tags: communityDetails.tags ?? (currentForm?.tags && currentForm?.tags.length > 0 ? currentForm?.tags : []),
                        } as UpdateCommunityForm}
                        validate={values => {
                            const errors: FormikErrors<any> = {};
                            if (!values.name) {
                                errors.name = 'Name is required';
                            } else if (!values.avatar) {
                                errors.avatar = 'Community avatar is required' ;
                            } else if (!values.tags || !values.tags.length) {
                                errors.tags = 'Tags is required'
                            } else if (!values.isPrivate) {
                                errors.tags = 'Must Indicate if it\'s private or public'
                            }

                            return errors;
                        }}
                        onSubmit={async (values, { setSubmitting }) => {
                            await putRecord(values);
                        }}
                    >
                        {({
                            values,
                            errors,
                            handleSubmit,
                            setFieldValue,
                            isSubmitting,
                            /* and other goodies */
                        }) => (
                            <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
                                <Image
                                    src={values.avatar ? values.avatar : 'https://robohash.org/placeholder'}
                                    alt={values.name}
                                    height={40}
                                    width={40}
                                    className='h-20 w-20 rounded-full'
                                />
                                
                                {currentStep === 0 && (
                                    <ListOrCommunityFormInputs type={CommonUpsertBoxTypes.UpdateCommunity} />
                                )}
              
                                {showReviewForm && (
                                    <ReviewForm
                                        sections={[
                                            {
                                                title: reviewInfoSectionTitle,
                                                jsx: (
                                                    <ReviewUpsertListOrCommunity
                                                        name={values.name}
                                                        avatarOrImage={values.avatar}
                                                        visibility={values.isPrivate}
                                                        tags={values.tags}
                                                        type={CommonUpsertBoxTypes.UpdateCommunity}
                                                    />
                                                ),
                                            }
                                        ]}
                                        type={CommonUpsertBoxTypes.UpdateCommunity}
                                    />
                                )}
                                <div className="flex justify-between items-center mt-2 w-full space-x-2">
                                    {currentStep > 0 && (
                                        <button
                                            type="button"
                                            onClick={setCurrentStep(currentStep === 0 ? 0 : currentStep - 1, values)}
                                            className="rounded-full bg-gray-200 px-5 py-2 font-bold text-gray-700"
                                        >
                                            Back
                                        </button>
                                    )}

                                    {currentStep === (lastStepBeforeReview + 1)
                                        ? (
                                            <button
                                                type='submit'
                                                disabled={Object.values(errors).some(v => !!v) || loadingUpsert}
                                                className={`rounded-full bg-maydan px-5 py-2 font-bold text-white disabled:opacity-40`}
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
                                                ) : (
                                                    'Submit'
                                                )}
                                            </button>
                                        )
                                        : currentStep === lastStepBeforeReview ? (
                                            <button
                                                type="button"
                                                onClick={setCurrentStep(currentStep + 1, values)}
                                                disabled={Object.values(errors).some(v => !!v)}
                                                className={`rounded-full bg-maydan px-5 py-2 font-bold text-white disabled:opacity-40`}
                                            >
                                                Review
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={setCurrentStep(currentStep + 1, values)}
                                                disabled={Object.values(errors).some(v => !!v)}
                                                className={`rounded-full bg-maydan px-5 py-2 font-bold text-white disabled:opacity-40`}
                                            >
                                                Next
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

export default observer(UpdateCommunityModal);