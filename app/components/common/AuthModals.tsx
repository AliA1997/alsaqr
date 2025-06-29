import { ModalBody, ModalPortal } from "@components/common/Modal";
import { FilterKeys, useStore } from "@stores/index";
import { ROUTES_USER_CANT_ACCESS } from "@utils/constants";
import { Formik, FormikErrors } from "formik";
import { motion } from "framer-motion";
import { observer } from "mobx-react-lite";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useCallback, useMemo } from "react";
import { CommonUpsertBoxTypes, User, UserItemToDisplay, UserRegisterForm } from "typings.d";
import { HobbiesAndOptionalInfoFormInputs, PersonalInfoFormInputs } from "./RegisterForm";
import UsersFeed from "@components/users/UsersFeed";
import { ReviewForm, ReviewUserHobbiesAndOtherInfo, ReviewUserPersonalInfo, ReviewUsersAdded } from "./ReviewForm";
import { ProfileImagePreview } from "./Containers";


export const LoginModal = observer(() => {
  const { modalStore } = useStore();
  const { closeModal } = modalStore;
  const handleGoogleSignIn = () => signIn("google");
  const { data: session } = useSession();

  return (
    <ModalPortal>
      <ModalBody onClose={() => {
        const canCloseLoginModal = !(ROUTES_USER_CANT_ACCESS.some(r => window.location.href.includes(r)));
        if ((!session || !session!.user) && canCloseLoginModal)
          closeModal();

      }}>
        <button
          className={`
                flex items-center p-3 border rounded-lg font-medium 
                text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-800
                dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white
              `}
          onClick={handleGoogleSignIn}
        >
          <Image
            src="/google-icon.svg"
            height={20}
            width={20}
            alt="Google Social Button Icon"
            className="mr-2"
          />
          Sign in with Google
        </button>
      </ModalBody>
    </ModalPortal>
  );
});

type RegisterModalProps = {
  userInfo: { [key:string]: any } | undefined;
}

export const  RegisterModal = observer(({ userInfo }: RegisterModalProps) => {
  const { authStore, modalStore } = useStore();
  const { 
    setCurrentStepInUserRegistration, 
    loadingRegistration, 
    currentStepInUserRegistration, 
    setCurrentRegistrationForm, 
    currentRegistrationForm ,
    completeRegistration
  } = authStore;
  const { closeModal } = modalStore;
  const loggedInUserId = useMemo(() => userInfo?.id, [userInfo]);

  const setCurrentStep = useCallback((val: number, currentForm?: UserRegisterForm) => (e: any) => {
    e.preventDefault();
    setCurrentStepInUserRegistration(val);
    if(val > 0 && currentForm)
      setCurrentRegistrationForm(currentForm!);
  }, [currentStepInUserRegistration])

  const currentStep = useMemo(() => currentStepInUserRegistration ?? 0, [currentStepInUserRegistration]);
  const lastStepBeforeReview = useMemo(() => currentStepInUserRegistration === 2, [currentStepInUserRegistration]);
  const showReviewForm = useMemo(() => currentStepInUserRegistration === 3, [currentStepInUserRegistration]);
  // alert(currentStepInUserRegistration)
  return (
    <ModalPortal className='h-15'>
      <ModalBody onClose={() => {
        closeModal();
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex space-x-2 p-5"
        >
          {/* <div className="flex flex-1 item-center pl-2"> */}
          <Formik
            initialValues={{
              avatar: currentRegistrationForm.avatar ? currentRegistrationForm.avatar : userInfo?.avatar ?? '',
              bgThumbnail: currentRegistrationForm.bgThumbnail ? currentRegistrationForm.bgThumbnail : userInfo?.bgThumbnail ?? '',
              username: currentRegistrationForm.username ? currentRegistrationForm.username : userInfo?.username ?? '',
              bio: currentRegistrationForm.bio ? currentRegistrationForm.bio : userInfo?.bio ?? '',
              email: currentRegistrationForm.email ? currentRegistrationForm.email : userInfo?.email ?? '',
              firstName: currentRegistrationForm.firstName ? currentRegistrationForm.firstName : userInfo?.firstName ?? '',
              lastName: currentRegistrationForm.lastName ? currentRegistrationForm.lastName : '',
              dateOfBirth: currentRegistrationForm.dateOfBirth ? currentRegistrationForm.dateOfBirth : userInfo?.dateOfBirth,
              countryOfOrigin: currentRegistrationForm.countryOfOrigin ? currentRegistrationForm.countryOfOrigin : userInfo?.countryOfOrigin ?? '',
              hobbies: currentRegistrationForm.hobbies ? currentRegistrationForm.hobbies : userInfo?.hobbies ?? [],
              maritalStatus: currentRegistrationForm.maritalStatus ? currentRegistrationForm.maritalStatus : userInfo?.maritalStatus ?? "single",
              religion: currentRegistrationForm.religion ? currentRegistrationForm.religion : userInfo?.religion ??  "Prefer Not To Disclose",
              followingUsers: currentRegistrationForm.followingUsers ? currentRegistrationForm.followingUsers : []
            } as UserRegisterForm}
            validate={values => {
              const errors: FormikErrors<any> = {};


              return errors;
            }}
            onSubmit={async (values, { setSubmitting }) => {
              await completeRegistration(loggedInUserId, values);
              setSubmitting(false);
              closeModal();
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
                  {showReviewForm && <h3 className="font-medium text-lg p-4">Review Registration</h3>}
                  <ProfileImagePreview 
                      avatar={values.avatar}
                      bgThumbnail={values.bgThumbnail}
                      username={values.username}
                  />

                {currentStepInUserRegistration === 0 && (
                  <PersonalInfoFormInputs 
                    avatar={values.avatar} 
                    bgThumbnail={values.bgThumbnail} 
                    username={values.username}
                  />
                )}
                {currentStepInUserRegistration === 1 && (
                  <HobbiesAndOptionalInfoFormInputs
                    avatar={values.avatar} 
                    bgThumbnail={values.bgThumbnail} 
                    username={values.username}
                  />
                )}
                {currentStepInUserRegistration === 2 && (
                    <UsersFeed
                        title="Users to Add"
                        loggedInUserId={loggedInUserId}
                        filterKey={FilterKeys.Register}
                        onAddOrFollow={(u: UserItemToDisplay) => {
                            const userFoundIdx = values.followingUsers.findIndex(userItem => userItem.user.id === u.user.id);
                            debugger;
                            if (userFoundIdx !== -1) {
                                const newFollowingUsersArray = values.followingUsers.slice();
                                newFollowingUsersArray.splice(userFoundIdx, 1);
                                setFieldValue('followingUsers', newFollowingUsersArray);
                            } else {
                                const distinctUsers = Array.from(new Set([...values.followingUsers, u]).values());
                                setFieldValue('followingUsers', distinctUsers);
                            }
                        }}
                        usersAlreadyAddedOrFollowedByIds={values.followingUsers.map(u => u.user.id)}
                    />
                )}
                
                {showReviewForm && (
                  <ReviewForm
                      sections={[
                        {
                            title: 'User Personal Info',
                            jsx: (
                                <ReviewUserPersonalInfo
                                    email={values.email}
                                    username={values.username}
                                    firstName={values.firstName}
                                    lastName={values.lastName}
                                    avatar={values.avatar}
                                    bgThumbnail={values.bgThumbnail}
                                    dateOfBirth={values.dateOfBirth}
                                />
                            ),
                        },
                        {
                            title: 'Hobbies and Other Info',
                            jsx: (
                                <ReviewUserHobbiesAndOtherInfo
                                    countryOfOrigin={values.countryOfOrigin ?? ''}
                                    hobbies={values.hobbies ?? []}
                                    maritalStatus={values.maritalStatus ?? ''}
                                    religion={values.religion ?? ''}
                                />
                            ),
                        },
                        {
                            title: 'Users Followed',
                            jsx: (
                              <ReviewUsersAdded
                                  usersAdded={values.followingUsers}
                              />
                            ),
                        }
                      ]}
                      type={CommonUpsertBoxTypes.Register}
                      hideTitle={true}
                  />
                )}

                <div className="flex justify-between items-center mt-2 w-full space-x-2">
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={setCurrentStep(currentStep === 0 ? 0 : currentStep - 1)}
                      className="rounded-full bg-gray-200 px-5 py-2 font-bold text-gray-700"
                    >
                      Back
                    </button>
                  )}

                  {showReviewForm
                    ? (
                      <button
                        type='submit'
                        disabled={Object.values(errors).some(v => !!v) || loadingRegistration}
                        className={`rounded-full bg-maydan px-5 py-2 font-bold text-white disabled:opacity-40`}
                      >
                        {loadingRegistration ? (
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
                    : lastStepBeforeReview ? (
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
});