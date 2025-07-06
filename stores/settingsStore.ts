import agent from '@utils/common';
import { DEFAULT_USER_REGISTRATION_FORM } from '@utils/constants';
import { makeAutoObservable, action, runInAction } from 'mobx';
import { UpdateUserForm, UpdateUserFormDto } from 'models/users';
import { store } from '.';
import { signOut } from 'next-auth/react';
import { SettingsTabs } from 'models/enums';
import { User } from 'typings';

export default class SettingsStore {
    constructor() {
        makeAutoObservable(this);
    }
    loadingUpsert: boolean = false;
    currentTabIdx: SettingsTabs = SettingsTabs.PersonalInfo;
    currentStepInUserUpdate: number | undefined = 0;
    currentUserUpdateForm: UpdateUserForm | undefined = undefined;

    setLoadingUpsert = (val: boolean) => {
        this.loadingUpsert = val;
    }
    setCurrentStepInUserUpdate = (val: number | undefined) => {
        this.currentStepInUserUpdate = val;
    };
    setCurrentUpdateUserForm = (val: UpdateUserForm | undefined) => {
        this.currentUserUpdateForm = val;
    }
    setCurrentTabIdx = (val: SettingsTabs) => {
        debugger;
        this.currentTabIdx = val;
    }

    updateYourAccount = async (userId: string, updateUserForm: UpdateUserForm) => {
        this.setLoadingUpsert(true);
        try {
            const updateUserFormDto: UpdateUserFormDto = updateUserForm;

            await agent.userApiClient.updateUser(userId, updateUserFormDto) ?? {};

            runInAction(() => {
                store.authStore.setCurrentSessionUser(updateUserForm as User);
                this.setCurrentUpdateUserForm(undefined);
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

            await signOut();

        } finally {
            this.setLoadingUpsert(false);
            store.authStore.navigateBackToHome();

            store.authStore.setCurrentSessionUser(undefined);
        }
    }

}
