import { makeAutoObservable, action } from 'mobx';
import { User } from 'typings';

export default class AuthStore {
  currentUser: User | undefined = undefined;

  constructor() {
    makeAutoObservable(this);
  }

  setCurrentUser = action((currentUserPayload: User | undefined) => {
    this.currentUser = currentUserPayload;
  });

  navigateBackToHome = action(() => {
    window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/`;
  });

  resetAuthState = action(() => {
    this.currentUser = undefined;
  });
  
}
