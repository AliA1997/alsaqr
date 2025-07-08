"use client";
import { ModalBody, ModalPortal } from "@components/common/Modal";
import { faker } from "@faker-js/faker";
import { FilterKeys, useStore } from "@stores/index";
import { FieldHelperProps, Formik, FormikErrors } from "formik";
import { motion } from "framer-motion";
import { PagingParams } from "models/common";
import { useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { CommonUpsertBoxTypes, CreateListOrCommunityForm, PostToDisplay, UserItemToDisplay } from "typings.d";
import { observer } from "mobx-react-lite";
import { ListOrCommunityFormInputs } from "./ListOrCommunityForm";
import UsersFeed from "@components/users/UsersFeed";
import { default as PostsFeed } from "@components/shared/Feed";
import { ReviewForm, ReviewUpsertListOrCommunity, ReviewPostsAdded, ReviewUsersAdded } from "./ReviewForm";
import Image from 'next/image';
import { DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM } from "@utils/constants";

interface Props {
    type: CommonUpsertBoxTypes;
    loggedInUserId: string;
    communityId?: string;
}

function ListOrCommunityUpsertModal({ type, loggedInUserId, communityId }: Props) {
    const toastMessage = useMemo(
                            () => type === CommonUpsertBoxTypes.List 
                                ? 'New List Created' 
                                : type === CommonUpsertBoxTypes.CommunityDiscussion
                                    ? "Community Discussion Started" : 'New Community Found', 
                            [type]
                        );

    const { modalStore, communityFeedStore, communityDiscussionFeedStore, listFeedStore, searchStore } = useStore();
    const { closeModal } = modalStore;

    const currentStep = useMemo(() => {
        if (type === CommonUpsertBoxTypes.Community) return (communityFeedStore.currentStepInCommunityCreation ?? 0);
        else if (type === CommonUpsertBoxTypes.CommunityDiscussion) return (communityDiscussionFeedStore.currentStepInCommunityDiscussionCreation ?? 0);
        else return (listFeedStore.currentStepInListCreation ?? 0);
    }, [
        type, 
        communityFeedStore.currentStepInCommunityCreation, 
        communityDiscussionFeedStore.currentStepInCommunityDiscussionCreation, 
        listFeedStore.currentStepInListCreation
    ]);
    const currentForm = useMemo(() => {
        if (type === CommonUpsertBoxTypes.Community) return communityFeedStore.communityCreationForm;
        else if (type === CommonUpsertBoxTypes.CommunityDiscussion) return (communityDiscussionFeedStore.communityDiscussionCreationForm ?? 0);
        else return listFeedStore.listCreationForm;
    }, [
        type, 
        communityFeedStore.currentStepInCommunityCreation, 
        communityDiscussionFeedStore.currentStepInCommunityDiscussionCreation, 
        listFeedStore.currentStepInListCreation
    ])


    const setCurrentStep = (val: number, form: CreateListOrCommunityForm) => (e: any) => {
        e.preventDefault();
        if (type === CommonUpsertBoxTypes.Community) {
            communityFeedStore.setCommunityCreationForm(form);
            return communityFeedStore.setCurrentStepInCommunityCreation(val)
        }
        else if (type === CommonUpsertBoxTypes.CommunityDiscussion) {
            communityDiscussionFeedStore.setCommunityDiscussionCreationForm(form);
            return communityDiscussionFeedStore.setCurrentStepInCommunityDiscussionCreation(val)
        }
        else {
            listFeedStore.setListCreationForm(form);
            return listFeedStore.setCurrentStepInListCreation(val);
        }
    };


    const feedLoadingInitial = useMemo(() => {
        if(type === CommonUpsertBoxTypes.Community) return communityFeedStore.loadingInitial;
        else if(type === CommonUpsertBoxTypes.CommunityDiscussion) return communityDiscussionFeedStore.loadingInitial;
        else return listFeedStore.loadingInitial;
    }, [
        communityFeedStore.loadingInitial,
        communityDiscussionFeedStore.loadingInitial,
        listFeedStore.loadingInitial
    ]);

    const resetPagingParams = useCallback(() => {
        if (type === CommonUpsertBoxTypes.Community)
            communityFeedStore.setPagingParams(new PagingParams(1, 10));
        else if (type === CommonUpsertBoxTypes.CommunityDiscussion)
            communityDiscussionFeedStore.setPagingParams(new PagingParams(1, 10));
        else
            listFeedStore.setPagingParams(new PagingParams(1, 10));
    }, [type]);
    
    const upsert: (form: any, userId: string, communityId?: string) => Promise<void> = useCallback(
        (form: any, userId: string, communityId?: string) => {
            if(type === CommonUpsertBoxTypes.Community)
                return communityFeedStore.addCommunity(form, userId);
            else if(type === CommonUpsertBoxTypes.CommunityDiscussion)
                return communityDiscussionFeedStore.addCommunityDiscussion(form, userId, communityId!);
            else
                return listFeedStore.addList(form, userId);
        },
        [type]
    );
    const upsertLoading = useMemo(() => {
        if(type === CommonUpsertBoxTypes.Community) return communityFeedStore.loadingInitial;
        else if(type === CommonUpsertBoxTypes.CommunityDiscussion) return communityDiscussionFeedStore.loadingUpsert;
        else return listFeedStore.loadingUpsert;
    }, [
        communityFeedStore.loadingInitial,
        communityDiscussionFeedStore.loadingUpsert,
        listFeedStore.loadingUpsert
    ]);
    const postRecord = async (values: any) => {
        let infoToUpsert: CreateListOrCommunityForm | undefined;

        if (type === CommonUpsertBoxTypes.Community)
            infoToUpsert = {
                name: values.name,
                avatarOrBannerImage: values.avatarOrBannerImage,
                isPrivate: values.isPrivate,
                tags: values.tags,
                usersAdded: values.usersAdded,
                postsAdded: []
            };
        else if (type === CommonUpsertBoxTypes.CommunityDiscussion)
            infoToUpsert = {
                name: values.name,
                avatarOrBannerImage: '',
                isPrivate: values.isPrivate,
                tags: values.tags,
                usersAdded: values.usersAdded,
                postsAdded: []
            };
        else if (type === CommonUpsertBoxTypes.List)
            infoToUpsert = {
                name: values.name,
                avatarOrBannerImage: values.avatarOrBannerImage,
                isPrivate: values.isPrivate,
                tags: values.tags,
                usersAdded: values.usersAdded,
                postsAdded: values.postsAdded
            };

        if(type === CommonUpsertBoxTypes.CommunityDiscussion)
            await upsert(infoToUpsert, loggedInUserId, communityId)
        else
            await upsert(infoToUpsert, loggedInUserId)

        resetPagingParams();

        setCurrentStep(0, DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM);

        closeModal();
        
        toast(toastMessage, {
            icon: "🚀",
        });

        await loadListsOrCommunities();
    };

    
    const loadListsOrCommunities = useCallback(
        () => {
            if (type === CommonUpsertBoxTypes.Community) return communityFeedStore.loadCommunities(loggedInUserId);
            else if (type === CommonUpsertBoxTypes.CommunityDiscussion) return communityDiscussionFeedStore.loadCommunityDiscussions(loggedInUserId, communityId!);
            else return listFeedStore.loadLists(loggedInUserId);
        },
        [type]
    );

    const showAddPosts = useMemo(() => type === CommonUpsertBoxTypes.List ? currentStep === 1 : false, [currentStep]);
    const showAddUsers = useMemo(() => type === CommonUpsertBoxTypes.List ? currentStep === 2 : currentStep === 1, [currentStep]);
    const showReviewForm = useMemo(() => type === CommonUpsertBoxTypes.List ? currentStep === 3 : currentStep === 2, [currentStep]);
    const lastStepBeforeReview = useMemo(() => type === CommonUpsertBoxTypes.List ? 2 : 1, [type]);
    const reviewInfoSectionTitle = useMemo(() => {
        if(type === CommonUpsertBoxTypes.Community) return "Community Info";
        else if(type === CommonUpsertBoxTypes.CommunityDiscussion) return "Community Discussion Info";
        else return "List Info";
    }, [type]);

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
                            name: currentForm?.name ?? '',
                            avatarOrBannerImage: currentForm?.avatarOrBannerImage ?? '',
                            isPrivate: currentForm?.isPrivate ?? 'public',
                            tags: currentForm?.tags && currentForm?.tags.length > 0 ? currentForm?.tags : [],
                            usersAdded: currentForm?.usersAdded && currentForm?.usersAdded.length > 0 ? currentForm?.usersAdded : [],
                            postsAdded: []
                        } as CreateListOrCommunityForm}
                        validate={values => {
                            const errors: FormikErrors<any> = {};
                            if (!values.name) {
                                errors.name = 'Name is required';
                            } else if (type != CommonUpsertBoxTypes.CommunityDiscussion && !values.avatarOrBannerImage) {
                                errors.avatarOrBannerImage = type === CommonUpsertBoxTypes.Community ? 'Community avatar is required' : 'List banner image is required'
                            } else if (!values.tags || !values.tags.length) {
                                errors.tags = 'Tags is required'
                            }
                            
                            return errors;
                        }}
                        onSubmit={async (values, { setSubmitting }) => {
                            await postRecord(values);
                            setSubmitting(false);
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
                                {type === CommonUpsertBoxTypes.Community 
                                    ? (
                                        <Image
                                            src={values.avatarOrBannerImage ? values.avatarOrBannerImage : 'https://robohash.org/placeholder'}
                                            alt={values.name}
                                            height={40}
                                            width={40}
                                            className='h-20 w-20 rounded-full'
                                        />
                                    )
                                    : type === CommonUpsertBoxTypes.List 
                                        ? (
                                            <motion.div 
                                                className="flex justify-center items-center bg-gray-100 w-full h-[10em] relative" 
                                                style={{ 
                                                    backgroundImage: `url('${values.avatarOrBannerImage}')`,
                                                    backgroundSize: 'cover',
                                                    backgroundRepeat: 'no-repeat'
                                                }}
                                            ></motion.div>
                                        ) : null
                                }
                                {currentStep === 0 && (
                                    <ListOrCommunityFormInputs type={type} />
                                )}
                                {showAddPosts && (
                                    <PostsFeed
                                        title="Posts to Add"
                                        hideTweetBox={true}
                                        filterKey={FilterKeys.SearchPosts}
                                        onAdd={(p: PostToDisplay) => {
                                            const postFoundIdx = values.postsAdded.findIndex(pst => pst.post.id === p.post.id);

                                            if (postFoundIdx !== -1) {
                                                const newPostsAddedArray = values.postsAdded.slice();
                                                newPostsAddedArray.splice(postFoundIdx, 1);
                                                setFieldValue('postsAdded', newPostsAddedArray);
                                            } else {
                                                const distinctPosts = Array.from(new Set([...values.postsAdded, p]).values());
                                                setFieldValue('postsAdded', distinctPosts);
                                            }
                                        }}
                                        postsAlreadyAddedByIds={values.postsAdded.map(pst => pst.post.id)}
                                    />
                                )}
                                {showAddUsers && (
                                    <UsersFeed
                                        title="Users to Add"
                                        loggedInUserId={loggedInUserId}
                                        filterKey={FilterKeys.SearchUsers}
                                        onAddOrFollow={(u: UserItemToDisplay) => {
                                            const userFoundIdx = values.usersAdded.findIndex(user => user.user.id === u.user.id);

                                            if (userFoundIdx !== -1) {
                                                const newUsersAddedArray = values.usersAdded.slice();
                                                newUsersAddedArray.splice(userFoundIdx, 1);
                                                setFieldValue('usersAdded', newUsersAddedArray);
                                            } else {
                                                const distinctUsers = Array.from(new Set([...values.usersAdded, u]).values());
                                                setFieldValue('usersAdded', distinctUsers);
                                            }
                                        }}
                                        usersAlreadyAddedOrFollowedByIds={values.usersAdded.map(u => u.user.id)}
                                    />
                                )}
                                {showReviewForm && (
                                    <ReviewForm
                                        sections={
                                            (function () {
                                                var sections = [
                                                    {
                                                        title: reviewInfoSectionTitle,
                                                        jsx: (
                                                            <ReviewUpsertListOrCommunity
                                                                name={values.name}
                                                                avatarOrImage={values.avatarOrBannerImage}
                                                                visibility={values.isPrivate}
                                                                tags={values.tags}
                                                                type={type}
                                                            />
                                                        ),
                                                    },
                                                    {
                                                        title: 'Users Added',
                                                        jsx: (
                                                            <ReviewUsersAdded
                                                                usersAdded={values.usersAdded}
                                                            />
                                                        ),
                                                    }
                                                ];

                                                if (type === CommonUpsertBoxTypes.List)
                                                    sections = [
                                                        sections[0],
                                                        {
                                                            title: 'Posts Added',
                                                            jsx: (
                                                                <ReviewPostsAdded
                                                                    postsAdded={values.postsAdded}
                                                                />
                                                            ),
                                                        },
                                                        sections[1]
                                                    ];

                                                return sections;
                                            }())
                                        }
                                        type={type}
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
                                                disabled={Object.values(errors).some(v => !!v) || feedLoadingInitial}
                                                className={`rounded-full bg-maydan px-5 py-2 font-bold text-white disabled:opacity-40`}
                                            >
                                                {upsertLoading ? (
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

export default observer(ListOrCommunityUpsertModal);