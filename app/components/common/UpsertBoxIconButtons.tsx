import React from 'react';
import { EmojiHappyIcon, PhotographIcon } from "@heroicons/react/outline";
import { useCallback, useRef, useState } from "react";
import Picker from "@emoji-mart/react";
import emojiData from "@emoji-mart/data";

type Props = {
    setInput: (val: string) => void;
    input: string;
    setImage: (val: string) => void;

};


function UpsertBoxIconButton({ input, setInput, setImage }: Props) {
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
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

    return (
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
    );
}

export default UpsertBoxIconButton;