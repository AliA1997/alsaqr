import { makeAutoObservable } from "mobx";
import { ModalKeys } from "models/common";
import React from "react";

export default class ModalStore {
    
    constructor() {
        makeAutoObservable(this);
    }
    
    loadingInitial = false;
    modalToShow: React.ReactNode | undefined = undefined;
    completeRegistrationModalShown = false;
    // showLoginModal = false;
    showModal = (modalToShow: React.ReactNode) => {
        this.modalToShow = modalToShow;
    }
    closeModal = () => {
        this.modalToShow = undefined;
    }
    setCompleteRegistrationModalShown = (val: boolean) => {
        this.completeRegistrationModalShown = val;
    }
}