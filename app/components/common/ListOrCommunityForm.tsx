import { FieldHelperProps, Formik, FormikErrors } from "formik";
import { motion } from "framer-motion";
import { FileUploadInput, MyInput } from "./Inputs";
import { RadioCard } from "./RadioBoxes";
import { MultiSelect } from "./MultiSelect";
import { useSession } from "next-auth/react";
import { useCallback, useMemo } from "react";
import { useStore } from "@stores/index";
import { CommonUpsertBoxTypes } from "typings.d";
import { PagingParams } from "models/common";
import { faker } from "@faker-js/faker";
import toast from "react-hot-toast";
import { observer } from "mobx-react-lite";


interface Props {
    type: CommonUpsertBoxTypes;
}

const options = [
    {
        value: 'public',
        label: 'Public',
        description: 'Anyone can join, will not be notified when someone joins',
    },
    {
        value: 'private',
        label: 'Private',
        description: 'Anyone can join, but whenever someone join\'s you will get notified',
    },
];


const tagOptions = [
    {
        value: 'tech',
        label: 'Tech',
    },
    {
        value: 'business',
        label: 'Business',
    },
    {
        value: 'politics',
        label: 'Politics',
    },
    {
        value: 'religion',
        label: 'Religion',
    },
];


export const ListOrCommunityFormInputs = observer(({ type }: Props) => {

    const { data: session } = useSession();
    const { user } = session ?? {};
    const userId = useMemo(() => user ? (user as any)["id"] : "", [session]);

    const handleFileChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>, helpers: FieldHelperProps<any>) => {
            const file = event.target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    helpers.setValue(reader.result as any);
                };
                reader.readAsDataURL(file);
            }
        },
        []
    );

    const namePlaceholder = useMemo(() => {
        if(type === CommonUpsertBoxTypes.Community) return 'New Community';
        else if(type === CommonUpsertBoxTypes.CommunityDiscussion) return 'New Community Discussion';
        else return 'New List';
    }, [type])

    const fileUploadLabel = useMemo(() => type === CommonUpsertBoxTypes.Community ? 'Avatar' : 'Banner Image', [type])
    
    const tagsLabel = useMemo(() => {
        if(type === CommonUpsertBoxTypes.Community)
            return "Select Hashtags associated with Community";
        else if(type === CommonUpsertBoxTypes.CommunityDiscussion)
            return "Select Hashtags associated with the Discussion";
        else
            return "Select Hashtags associated with List";
    }, [type])


    return (
        <>
            <MyInput
                name="name"
                placeholder={namePlaceholder}
                className="mb-4"
            />
            {type === CommonUpsertBoxTypes.Community || type === CommonUpsertBoxTypes.List && (
                <FileUploadInput
                    name="avatarOrBannerImage"
                    label={fileUploadLabel}
                    handleFileChange={handleFileChange}
                />
            )}
            
            {!(type === CommonUpsertBoxTypes.List) && (
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
            )}

            <MultiSelect
                name="tags"
                label={tagsLabel}
                placeholder="Select Hashtags"
                options={tagOptions}
            />
        </>
    );
});
