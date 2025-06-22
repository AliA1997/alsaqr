import { makeAutoObservable } from "mobx";

export default class ModalStore {
    
    constructor() {
        makeAutoObservable(this);
    }
    
    loadingInitial = false;
    showLoginModal = false;

    toggleLoginModal = (doShow: boolean) => {
        this.showLoginModal = doShow;
    }

    resetModalsState = () => {
        this.showLoginModal = false;
        this.loadingInitial = false;
    }
}