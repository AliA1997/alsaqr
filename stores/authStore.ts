import { makeAutoObservable, action } from 'mobx';
import { User } from 'typings';

export default class AuthStore {
  currentUser: User | undefined = undefined;

  constructor() {
    makeAutoObservable(this);
  }
  loadingRegistration: boolean = false;
  currentStepInUserRegistration: number | undefined = 0;

  setLoadingRegistration = (val: boolean) => {
    this.loadingRegistration = val;
  }
  setCurrentStepInUserRegistration = (val: number | undefined) => {
    this.currentStepInUserRegistration = val;
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
  
}
