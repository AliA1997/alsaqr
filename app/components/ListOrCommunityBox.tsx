import { EmojiHappyIcon, PhotographIcon } from "@heroicons/react/outline";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { CommonUpsertBoxTypes, CommunityRecord, ListRecord } from "@typings";
import { useSession } from "next-auth/react";
import {
    getEmailUsername,
} from "@utils/neo4j/index";
import Picker from "@emoji-mart/react";
import emojiData from "@emoji-mart/data";
import { faker } from "@faker-js/faker";
import { XIcon } from "@heroicons/react/solid"; // Import the XMarkIcon

import { useStore } from "@stores/index";
import { observer } from "mobx-react-lite";
import { Field, FieldHelperProps, Formik, FormikErrors, FormikHelpers } from "formik";
import { FileUploadInput, MyInput } from "./common/Inputs";
import { RadioCard } from "./common/RadioBoxes";
import { MultiSelect } from "./common/MultiSelect";



function ListOrCommunityBox({ type }: Props) {

    const { listFeedStore, communityFeedStore } = useStore();
    const { loadingInitial, resetPagingParams } = listFeedStore;

    // const boxUpsertLoading = useMemo(
    //     () => {
    //         if (type === CommonUpsertBoxTypes.List) return listFeedStore.loadingInitial;
    //         else if (type === CommonUpsertBoxTypes.Community) return communityFeedStore.loadingInitial;
    //     },
    //     [listFeedStore.loadingInitial, communityFeedStore.loadingInitial]
    // );


    // const [submitting, setSubmitting] = useState(false);
    // const imageInputRef = useRef<HTMLInputElement>(null);


    // const handleUploadImage = useCallback(() => {
    //     imageInputRef?.current?.click();
    // }, []);



    // Validation schema based on type
    // const validationSchema = Yup.object().shape({
    //     name: Yup.string().required('Name is required'),
    //     avatar: Yup.string(),
    //     isPrivate: Yup.boolean(),
    //     tags: Yup.array().of(Yup.string()),
    // });


    // const handleInputChange = useCallback(
    //     (e: React.ChangeEvent<HTMLInputElement>) => {
    //         setInput(e.target.value);
    //     },
    //     []
    // );


    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex space-x-2 p-5"
        >
            <div className="flex flex-1 item-center pl-2">
                <Formik
                    initialValues={{
                        name: '',
                        avatar: '',
                        isPrivate: false,
                        tags: [],
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
                            <MyInput
                                name="name"
                                placeholder={namePlaceholder}
                                className="mb-4"
                            />
                            <FileUploadInput
                                name={fileUploadName}
                                label={fileUploadLabel}
                                handleFileChange={handleFileChange}
                            />
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Visibility Status
                                </h3>

                                <div className="grid gap-3 md:grid-cols-3">
                                    {options.map((option) => (
                                        <RadioCard 
                                            key={option.value}
                                            name="isPrivate"
                                            value={option.value}
                                            label={option.label}
                                            description={option.description}
                                        />
                                    ))}
                                </div>
                            </div>
                            <MultiSelect
                                name="tags"
                                label="Select Tags associated with Community"
                                placeholder="Select Tags"
                                options={tagOptions}
                            />
                            <div className="flex items-center mt-2">
                                <button
                                    type='submit'
                                    disabled={Object.values(errors).some(v => !!v) || loadingInitial}
                                    className={`rounded-full bg-maydan px-5 py-2 font-bold text-white
                    disabled:opacity-40`}
                                >
                                    {loadingInitial ? (
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
                                        <>{buttonText}</>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </Formik>
            </div>
        </motion.div>
    );
}

export default observer(ListOrCommunityBox);