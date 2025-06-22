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

interface Props {
    type: CommonUpsertBoxTypes;
}

function ListOrCommunityBox({ type }: Props) {
    const { data: session } = useSession();
    const { user } = session ?? {};
    const userId = useMemo(() => user ? (user as any)["id"] : "", [session]);
    const { listFeedStore, communityFeedStore } = useStore();
    const { loadingInitial, resetPagingParams } = listFeedStore;

    const boxUpsertLoading = useMemo(
        () => {
            if (type === CommonUpsertBoxTypes.List) return listFeedStore.loadingInitial;
            else if (type === CommonUpsertBoxTypes.Community) return communityFeedStore.loadingInitial;
        },
        [listFeedStore.loadingInitial, communityFeedStore.loadingInitial]
    );
    const upsert: (form: any, userId: string) => Promise<void> = useMemo(
        () => {
            if (type === CommonUpsertBoxTypes.Community) return communityFeedStore.addCommunity;
            else return listFeedStore.addList;
        },
        [type]
    );
    const loadListsOrCommunities = useMemo(
        () => {
            if (type === CommonUpsertBoxTypes.Community) return communityFeedStore.loadCommunities;
            else return listFeedStore.loadLists;
        },
        [type]
    );

    const buttonText = useMemo(() => type === CommonUpsertBoxTypes.List ? 'Create New List' : 'Create New Community', [type]);
    const toastMessage = useMemo(() => type === CommonUpsertBoxTypes.List ? 'New List Created' : 'New Community Found', [type]);

    const [input, setInput] = useState<string>("");
    const [avatar, setAvatar] = useState<string>("");
    const [image, setImage] = useState<string>("");
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
    const [isPrivate, setIsPrivate] = useState<boolean>(false);
    const [tags, setTags] = useState<string[]>([]);

    const [submitting, setSubmitting] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const handleShowEmojiPicker = useCallback(
        () => setShowEmojiPicker(!showEmojiPicker),
        []
    );
    const handleEmojiSelect = useCallback(
        (iValue: string) => (emoji: any) => {
            const newInputValue = iValue + emoji.native;
            setInput(newInputValue);
            setShowEmojiPicker(false);
        },
        []
    );
    const handleEmojiSelectClickOutside = useCallback(
        () => setShowEmojiPicker(false),
        []
    );

    const handleUploadImage = useCallback(() => {
        imageInputRef?.current?.click();
    }, []);

    const handleFileChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImage(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
        },
        []
    );


    const formToUpsert = useMemo(() => {
        let infoToUpsert: ListRecord | CommunityRecord | undefined;

        if (type === CommonUpsertBoxTypes.Community)
            infoToUpsert = {
                id: `community_${faker.datatype.uuid()}`,
                userId,
                name: input,
                avatar: avatar,
                bannerImage: image,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                _rev: '',
                _type: "community",
                isPrivate: isPrivate,
                tags: tags
            } as CommunityRecord
        else if (type === CommonUpsertBoxTypes.List)
            infoToUpsert = {
                id: `list_${faker.datatype.uuid()}`,
                userId,
                name: input,
                avatar: "",
                bannerImage: image,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                _rev: "",
                _type: "list"
            } as ListRecord

        return infoToUpsert;
    }, [type, input, image, avatar, isPrivate])

    const postRecord = async () => {
        await upsert(formToUpsert, userId)

        resetPagingParams();

        await loadListsOrCommunities(userId);

        toast(toastMessage, {
            icon: "🚀",
        });
    };

    const handleSubmit = useCallback(
        async (e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
            e.preventDefault();
            setSubmitting(true);

            await postRecord();

            setInput("");
            setImage("");
            setSubmitting(false);
        },
        [input, image]
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setInput(e.target.value);
        },
        []
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex space-x-2 p-5"
        >
            <img
                className="h-14 w-14 rounded-full object-cover mt-4"
                src={session?.user?.image}
                alt=""
            />
            <div className="flex flex-1 item-center pl-2">
                <form className="flex flex-1 flex-col">
                    <input
                        value={input}
                        onChange={handleInputChange}
                        type="text"
                        placeholder="What's Happening"
                        className="h-24 w-full text-xl outline-none placeholder:text-xl dark:bg-[#000000]"
                    />
                    {image && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className='relative'
                        >
                            <button
                                onClick={() => setImage("")} // Replace with your close logic
                                className="absolute left-2 top-2 z-10 rounded-full bg-red-800 p-2 text-white hover:bg-red-700 focus:outline-none"
                                aria-label="Close"
                            >
                                <XIcon className="h-5 w-5" />
                            </button>
                            <img
                                className="relative h-40 w-100 p-0 rounded-xl object-contain shadow-lg"
                                src={image}
                                alt="image/list"
                            />
                        </motion.div>
                    )}
                    <div className="flex items-center mt-2">
                        <div className="flex flex-1 space-x-2 text-maydan">
                            <PhotographIcon
                                onClick={handleUploadImage}
                                className="h-5 w-5 cursor-pointer
                                            transition-transform duration-150 ease-out
                                            hover:scale-150"
                            />
                            <input
                                type="file"
                                ref={imageInputRef}
                                hidden
                                onChange={handleFileChange}
                            />
                            <EmojiHappyIcon
                                onClick={handleShowEmojiPicker}
                                className="h-5 w-5 cursor-pointer
                                            transition-transform duration-150 ease-out
                                            hover:scale-150"
                            />
                            {showEmojiPicker && (
                                <div style={{ position: "absolute", zIndex: 1000 }}>
                                    <Picker
                                        data={emojiData}
                                        onEmojiSelect={handleEmojiSelect(input)}
                                        onClickOutside={handleEmojiSelectClickOutside}
                                    />
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={!input || loadingInitial}
                            className={`rounded-full bg-maydan px-5 py-2 font-bold text-white
              disabled:opacity-40`}
                            type="button"
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
            </div>
        </motion.div>
    );
}

export default observer(ListOrCommunityBox);