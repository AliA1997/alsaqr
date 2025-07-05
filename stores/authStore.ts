import agent from '@utils/common';
import { DEFAULT_USER_REGISTRATION_FORM } from '@utils/constants';
import { makeAutoObservable, action, runInAction } from 'mobx';
import { UpdateUserForm, UpdateUserFormDto } from 'models/users';
import { User, UserRegisterForm, UserRegisterFormDto } from 'typings';
import { store } from '.';
import { signOut } from 'next-auth/react';

export default class AuthStore {
  currentSessionUser: User | undefined = undefined;

  constructor() {
    makeAutoObservable(this);
  }
  loadingRegistration: boolean = false;
  loadingUpsert: boolean = false;
  currentStepInUserRegistration: number | undefined = 0;
  currentRegistrationForm: UserRegisterForm = DEFAULT_USER_REGISTRATION_FORM;
  currentStepInUserUpdate: number | undefined = 0;
  currentUserUpdateForm: UpdateUserForm | undefined = undefined;

  setLoadingRegistration = (val: boolean) => {
    this.loadingRegistration = val;
  }
  setLoadingUpsert = (val: boolean) => {
    this.loadingUpsert = val;
  }
  setCurrentStepInUserRegistration = (val: number | undefined) => {
    this.currentStepInUserRegistration = val;
  }
  setCurrentStepInUserUpdate = (val: number | undefined) => {
    this.currentStepInUserUpdate = val;
  };
  setCurrentRegistrationForm = (val: UserRegisterForm) => {
    this.currentRegistrationForm = val;
  }
  setCurrentUpdateUserForm = (val: UpdateUserForm | undefined) => {
    this.currentUserUpdateForm = val;
  }

  setCurrentSessionUser = (currentUserPayload: User | undefined) => {
    this.currentSessionUser = currentUserPayload;
  };

  navigateBackToHome = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/`;
  };

  resetAuthState = () => {
    this.currentSessionUser = undefined;
  };

  completeRegistration = async (userId: string, registerForm: UserRegisterForm) => {

      this.setLoadingRegistration(true);
      try {
        const registerFormDto: UserRegisterFormDto = {...registerForm, followingUsers: registerForm.followingUsers.map(u => u.user.id)};

        await agent.userApiClient.completeRegistration(userId, registerFormDto) ?? {};

        runInAction(() => {
          this.setCurrentUpdateUserForm(undefined);
          this.setCurrentStepInUserRegistration(0);
        });

      } finally {
          this.setLoadingRegistration(false);
      }

  }

  updateYourAccount = async (userId: string, updateUserForm: UpdateUserForm) => {
      this.setLoadingUpsert(true);
      try {
        const updateUserFormDto: UpdateUserFormDto = updateUserForm;

        await agent.userApiClient.updateUser(userId, updateUserFormDto) ?? {};

        runInAction(() => {
          this.setCurrentRegistrationForm(DEFAULT_USER_REGISTRATION_FORM);
          this.setCurrentStepInUserUpdate(0);
        });

      } finally {
          this.setLoadingUpsert(false);
      }
  }

  deleteYourAccount = async (userId: string) => {
      this.setLoadingUpsert(true);
      try {

        await agent.userApiClient.deleteUser(userId) ?? {};
        
        store.authStore.setCurrentSessionUser(undefined);

        await signOut();

      } finally {
          this.setLoadingUpsert(false);
      }
  }
  
}
