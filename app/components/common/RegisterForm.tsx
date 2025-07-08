import { FieldHelperProps } from "formik";
import { observer } from "mobx-react-lite";
import { useCallback } from "react";
import { FileUploadInput, MyDatePicker, MyInput } from "./Inputs";
import { MultiSelect } from "./MultiSelect";
import { RadioCard } from "./RadioBoxes";
import { HOBBIES_OPTIONS, MARITAL_STATUS_OPTIONS, RELIGION_OPTIONS } from "@utils/constants";
import { Select } from "./Select";
import { COUNTRY_OPTIONS } from "@utils/countriesOptions";

interface PersonalInfoFormInputsProps {}

export const PersonalInfoFormInputs = observer(({}: PersonalInfoFormInputsProps) => {

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

    return (
        <>
            <div>
                <MyInput
                    prefix='@'
                    name='username'
                    label="Username"
                    aria-label="username"
                    placeholder="Your @username"
                    className='mb-1 h-8 text-md'
                />
            </div>
            
            <MyInput
                name='bio'
                label="Your Introduction to Others"
                aria-label="Your Introduction to Others"
                placeholder="Provide a proper introduction"
                className='mb-1 h-8 text-md'
            />

            <div className='flex px-1'>
                <MyInput
                    name="firstName"
                    label="First Name"
                    aria-label="firstName"
                    placeholder="Your first name"
                    className="mb-1 h-8 text-md"
                />
                <MyInput
                    name="lastName"
                    label="Last Name"
                    aria-label="lastName"
                    placeholder="Your last name"
                    className="mb-1 h-8 text-md"
                />
            </div>
            <FileUploadInput
                name="avatar"
                label="Avatar"
                handleFileChange={handleFileChange}
            />
            <FileUploadInput
                name="bgThumbnail"
                label="Profile Background"
                handleFileChange={handleFileChange}
            />
            
            <MyDatePicker
                name="dateOfBirth"
                label="Date of Birth"
                aria-label="dateOfBirth"
                placeholder="05/01/2000"
                className="mb-1 h-8 text-md"
            />
        </>
    );
});




interface HobbiesAndOptionalInfoFormInputsProps {}

export const HobbiesAndOptionalInfoFormInputs = observer(({}: HobbiesAndOptionalInfoFormInputsProps) => {

    return (
        <>
             <Select
                name="countryOfOrigin"
                label="Country of Origin"
                placeholder="Select a Country"
                options={COUNTRY_OPTIONS}
                className="mb-1 h-8 text-md"
            />

            <MultiSelect 
                name="hobbies"
                label={"Hobbies"}
                placeholder="Select Hobbies"
                options={HOBBIES_OPTIONS}
            />

            <div>
                <label htmlFor="maritalStatus" className="block text-md font-medium text-gray-700 dark:text-gray-200">
                    Marital Status:
                </label>

                <div className="grid gap-4 md:grid-cols-4 py-2">
                    {MARITAL_STATUS_OPTIONS.map((option) => (
                        <RadioCard
                            key={option.value}
                            name="maritalStatus"
                            value={option.value}
                            label={option.label}
                            description={option.description}
                        />
                    ))}
                </div>
            </div>
 
             <Select
                name="religion"
                label="Religion"
                placeholder="Select a Religion"
                options={RELIGION_OPTIONS}
                className="mb-1 h-8 text-md"
            />
        </>
    );
});