
export interface FollowUserFormDto {
    userToFollowId: string;
}

export interface UnFollowUserFormDto {
    userToUnFollowId: string;
}

export interface UpdateUserForm {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: Date;
    username: string;
    bio: string;
    religion: string;
    maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
    hobbies?: string[];
    countryOfOrigin?: string;
    preferredMadhab?: 'Hanafi' | "Shafi'i" | 'Maliki' | 'Hanbali' | "Salafi" | "Prefer Not To Disclose";
    frequentMasjid?: string;
    favoriteQuranReciters?: string[];
    favoriteIslamicScholars?: string[];
    islamicStudyTopics?: string[];
}

export interface UpdateUserFormDto extends UpdateUserForm {}