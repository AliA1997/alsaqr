import agent from '@utils/common';
import { DEFAULT_USER_REGISTRATION_FORM } from '@utils/constants';
import { makeAutoObservable, action, runInAction } from 'mobx';
import { User, UserRegisterForm, UserRegisterFormDto } from 'typings';

export default class AuthStore {
  currentUser: User | undefined = undefined;

  constructor() {
    makeAutoObservable(this);
  }
  loadingRegistration: boolean = false;
  currentStepInUserRegistration: number | undefined = 0;
  currentRegistrationForm: UserRegisterForm = DEFAULT_USER_REGISTRATION_FORM;

  setLoadingRegistration = (val: boolean) => {
    this.loadingRegistration = val;
  }
  setCurrentStepInUserRegistration = (val: number | undefined) => {
    this.currentStepInUserRegistration = val;
  }
  setCurrentRegistrationForm = (val: UserRegisterForm) => {
    this.currentRegistrationForm = val;
  }

  setCurrentUser = (currentUserPayload: User | undefined) => {
    this.currentUser = currentUserPayload;
  };

  navigateBackToHome = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/`;
  };

  resetAuthState = () => {
    this.currentUser = undefined;
  };

  completeRegistration = async (userId: string, registerForm: UserRegisterForm) => {

      this.setLoadingRegistration(true);
      try {
        const registerFormDto: UserRegisterFormDto = {...registerForm, followingUsers: registerForm.followingUsers.map(u => u.user.id)};

        await agent.userApiClient.completeRegistration(userId, registerFormDto) ?? {};

        runInAction(() => {
          this.setCurrentRegistrationForm(DEFAULT_USER_REGISTRATION_FORM);
          this.setCurrentStepInUserRegistration(0);
        });

      } finally {
          this.setLoadingRegistration(false);
      }

  }
  
}
