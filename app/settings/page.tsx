"use client";
import React from 'react';
import { useStore } from "@stores/index";
import { observer } from "mobx-react-lite";
import { SettingsTabs } from 'models/enums';
import PersonalInfo from '@components/settings/PersonalInfo';
import { ProfileImagePreview } from '@components/common/Containers';
import PersonalizeAccount from '@components/settings/PersonalizeAccount';
import DeleteYourAccount from '@components/settings/DeleteYourAccount';


const Settings = observer(() => {
    const { authStore, settingsStore } = useStore();
    const { currentSessionUser } = authStore;
    const { currentTabIdx, currentUserUpdateForm } = settingsStore;
    return (
        <div className='scrollbar-hide border-x max-h-screen overflow-scroll'>
            <ProfileImagePreview
                avatar={currentUserUpdateForm?.avatar ?? currentSessionUser?.avatar ?? ''}
                bgThumbnail={currentUserUpdateForm?.bgThumbnail ?? currentSessionUser?.bgThumbnail ?? ''}
                username={currentUserUpdateForm?.username ?? currentSessionUser?.username ?? ''}
            />
            {currentTabIdx === SettingsTabs.PersonalInfo && (
                <PersonalInfo />
            )}
            {currentTabIdx === SettingsTabs.PersonalizeAccount && (
                <PersonalizeAccount />
            )}

            {currentTabIdx === SettingsTabs.DeleteYourAccount && (
                <DeleteYourAccount />
            )}
        </div>
    );
});

export default Settings;