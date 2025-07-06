import CheckboxCard from "@components/common/CheckboxCard";
import { InfoCardContainer } from "@components/common/Containers";
import { ConfirmModal } from "@components/common/Modal";
import { useStore } from "@stores/index";
import { Formik, FormikErrors } from "formik";
import { observer } from "mobx-react-lite";



const DeleteYourAccount = observer(() => {
    const { authStore, settingsStore, modalStore } = useStore();
    const { currentSessionUser } = authStore;
    const { loadingUpsert, deleteYourAccount } = settingsStore;
    const { showModal, closeModal } = modalStore;
    return (
        <div>
            <h1 className='text-bold text-3xl my-2'>Before you go...</h1>
            <InfoCardContainer>
                <Formik
                    initialValues={{
                        agreeToTerms: false
                    }}
                    validate={values => {
                        const errors: FormikErrors<any> = {};
                        if (!values.agreeToTerms) {
                            errors.name = 'Must agree to terms and conditions to delete your account';
                        }
                        return errors;
                    }}
                    onSubmit={async (values, { setSubmitting }) => {
                        showModal(
                            <ConfirmModal
                                title="Are you sure?"
                                confirmMessage=""
                                confirmButtonClassNames="bg-red-700"
                                confirmFunc={async () => {
                                    if (values.agreeToTerms)
                                        await deleteYourAccount(currentSessionUser?.id!);
                                }}
                                declineButtonText="Cancel"
                                confirmButtonText="Permanently Delete"
                                onClose={() => closeModal()}
                            >
                            <p className='my-2'>Are you sure you want to permanently delete your account?</p>
                            </ConfirmModal>
                        );
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
                            <div>
                                <p>
                                    <strong>Deleting your account is permanent and cannot be undone.</strong>
                                </p>

                                <ul>
                                    <li className='my-2'>All your profile information, posts, and data will be permanently removed</li>
                                    <li className='my-2'>You won't be able to reactivate your account or retrieve any content</li>
                                    <li className='my-2'>Your username will be available for others to claim</li>
                                </ul>

                                <CheckboxCard
                                    name="agreeToTerms"
                                    label="Agree to Terms"
                                    description="Agree to terms and  conditions described above."
                                />
                            </div>
                            <button
                                type='submit'
                                disabled={loadingUpsert}
                                className={`
                                    rounded-full max-w-sm bg-red-700 px-5 py-2 font-bold text-white disabled:opacity-40
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
                                    "Delete Your Account"
                                )}
                            </button>
                        </form>
                    )}
                </Formik>
            </InfoCardContainer>
        </div>
    );
});

export default DeleteYourAccount;