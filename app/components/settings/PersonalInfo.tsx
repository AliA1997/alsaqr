"use client";
import { ContentContainer, ContentContainerWithRef, InfoCardContainer } from "@components/common/Containers";
import { RadioCard } from "@components/common/RadioBoxes";
import { PersonalInfoFormInputs } from "@components/common/RegisterForm";
import { Select } from "@components/common/Select";
import { useStore } from "@stores/index";
import { MARITAL_STATUS_OPTIONS } from "@utils/constants";
import { COUNTRY_OPTIONS } from "@utils/countriesOptions";
import { Formik, FormikErrors } from "formik";
import { observer } from "mobx-react-lite";
import { PersonalInfoForm } from "models/settings";
import { UpdateUserForm } from "models/users";
import toast from "react-hot-toast";


const PersonalInfo = observer(() => {
    const { authStore, settingsStore } = useStore();
    const { currentSessionUser, navigateBackToHome } = authStore;
    const { 
        currentUserUpdateForm,
        setCurrentUpdateUserForm,
        loadingUpsert,
        updateYourAccount,
    } = settingsStore;

    const upsert = async (values: any) => {
        let infoToUpsert: UpdateUserForm  = {
            ...currentSessionUser,
            ...values
        };

        console.log('update personal info infoToUpsert:', infoToUpsert);
        debugger;
        if(currentSessionUser) {
            await updateYourAccount(currentSessionUser?.id!, infoToUpsert);

            toast("Updated your account", {
                icon: "🚀",
            });
        }
        else {
            toast("Need to be logged in to update your account");
            navigateBackToHome();
        }
    };
    
    return (
        <div>
            <h1 className='text-bold text-3xl'>Your Personal Info</h1>
            <InfoCardContainer>
                <Formik
                    initialValues={{
                        username: currentSessionUser?.username ?? "",
                        avatar: currentSessionUser?.avatar ?? "",
                        bgThumbnail: currentSessionUser?.bgThumbnail ?? "",
                        bio: currentSessionUser?.bio ?? "",
                        firstName: currentSessionUser?.firstName ?? "",
                        lastName: currentSessionUser?.lastName ?? "",
                        dateOfBirth: currentSessionUser?.dateOfBirth ?? "",
                        countryOfOrigin: currentSessionUser?.countryOfOrigin ?? '',
                    } as PersonalInfoForm}
                    validate={values => {
                        const errors: FormikErrors<any> = {};
                        if (!values.username) {
                            errors.name = 'Name is required';
                        } else if (!values.avatar) {
                            errors.avatar = 'Avatar is required';
                        } else if (!values.bgThumbnail) {
                            errors.bgThumbnail = 'Background for profile is required'
                        } else if (!values.bio) {
                            errors.bio = 'Bio is required';
                        } else if (!values.firstName) {
                            errors.firstName = 'First name is required';
                        } else if (!values.lastName) {
                            errors.lastName = 'Last name is required';
                        } else if (!values.dateOfBirth) {
                            errors.dateOfBirth = 'Date Of Birth is required';
                        } else if (!values.countryOfOrigin) {
                            errors.countryOfOrigin = 'Country of Origin is required';
                        }
                        
                        return errors;
                    }}
                    onSubmit={async (values, { setSubmitting }) => {
                        await upsert(values);
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
                            <PersonalInfoFormInputs />

                            <Select
                                    name="countryOfOrigin"
                                    label="Country of Origin"
                                    placeholder="Select a Country"
                                    options={COUNTRY_OPTIONS}
                                    className="mb-1 h-8 text-md"
                            />            

                            <button
                                type='submit'
                                disabled={Object.values(errors).some(v => !!v) || loadingUpsert}
                                className={`
                                    rounded-full max-w-sm bg-maydan px-5 py-2 font-bold text-white disabled:opacity-40
                                    self-center mt-3
                                    
                                `}
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
                                    'Update Your Personal Info'
                                )}
                            </button>
                        </form>
                    )}
                </Formik>

            </InfoCardContainer>

        </div>
    );
});

export default PersonalInfo;