import { AdapterUser } from "next-auth/adapters";

interface CommonReduxTweetsState {
  searchQry: string;
  page: number;
  limit: number;
}

export enum TypeOfFeed {
  Feed = "feed",
  Explore = "explore",
  Search = "search"
}

export enum NotificationType {
  Normal = "normal",
  Mentioned = "mentioned",
  Verified = "verified"
}

export enum MessageType {
  All = "All",
  Sent = "Sent"
}

export enum CommonUpsertBoxTypes {
  Post = "Post",
  List = "List",
  Community = "Community"
}


export type CommonRecordBody = {
  text: string;
  image?: string;
};


//  Relationships for User
// user -[:FOLLOW_USER] -> followedUser
// followedUser - [:FOLLOWED] -> user
// on unfollow -> delete FOLLOW_USER and FOLLOWED relationship
export interface ProfileUser {
  user: User;
  bookmarks: string[];
}


export interface UserItemToDisplay {
  user: User;
  following?: User[];
  followers?: User[];
}

export interface User extends UserInfo {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  dateOfBirth?: Date;
  geoId?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  hobbies?: string[];
  preferredMadhab?: 'Hanafi' | "Shafi'i" | 'Maliki' | 'Hanbali' | "Salafi";
  frequentMasjid?: string;
  favoriteQuranReciters?: string[];
  favoriteIslamicScholars?: string[];
  islamicStudyTopics?: string[];
  verified: boolean;
}

export type UserInfo = {
  username: string;
  bio?: string;
  countryOfOrigin: string;
  avatar: string;
  bgThumbnail: string;
  email: string;
  phone?: string;
  personalInfo?: PersonalInfo;
  personalInterests?: PersonalInterests;
};

export interface UserProfileDashboardPosts {
  userPosts: DashboardPostToDisplay[];
  bookmarkedPosts: DashboardPostToDisplay[];
  likedPosts: DashboardPostToDisplay[];
  repostedPosts: DashboardPostToDisplay[];
  repliedPosts: DashboardPostToDisplay[];
}

export interface DashboardPostToDisplay extends PostToDisplay {
  type: string;
}

export interface PostToDisplay {
  post: PostRecord,
  username: string;
  profileImg: string;
  comments: Comment[],
  commenters: User[],
  reposters: User[],
  likers: User[]
}

export interface PostRecord extends CommonRecordBody {
  id: string;
  createdAt: string;
  updatedAt: string;
  _rev: string;
  _type: "post";
  blockTweet: boolean;
  likes?: string[];
  userId?: string;
}


export interface Comment extends CommonRecordBody {
  id: string;
  postId: string;
  userId: string;
  image: string;
  createdAt: string;
  text: string;
  updatedAt: string;
}

export interface CommentToDisplay extends Comment {
  username: string;
  profileImg: string;
}

export interface ListRecord {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  bannerImage?: string;
  createdAt: string;
  updatedAt: string;
  _rev: string;
  _type: "list";
}

// export interface ListRecordToDisplay extends ListRecord {
//   listCreator: string;
//   listCreatorProfileImg: string;
// }

export interface ListToDisplay {
  list: ListRecordToDisplay,
  savedBy: UserInfo
}

export interface CommunityRecord {
  id: string;
  userId: string
  name: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  _rev: string;
  _type: "community";
  isPrivate: boolean;
  tags: string[];
}

export interface CommunityRecordToDisplay extends CommunityRecord {
  founder: string;
  founderProfileImg: string;
}

export interface CommunityToDisplay {
  community: CommunityRecordToDisplay,
  founder: UserInfo
}

export interface NotificationRecord extends CommonRecordBody {
  id: string;
  createdAt: string;
  updatedAt: string;
  _rev: string;
  _type: "notification";
  notificationType: NotificationType;
}

export interface NotificationToDisplay {
  notification: NotificationRecord,
}

export interface ServerError {
  statusCode: number;
  message: string;
  details: string;
}

export interface MessageRecord extends CommonRecordBody {
  id: string;
  createdAt: string;
  updatedAt: string;
  _rev: string;
  _type: "message";
  messageType: MessageType;
  senderId?: string;
  senderProfileImg?: string;
  senderUsername?: string;
  recipientId?: string;
  recipientProfileImg?: string;
  recipientUsername?: string;
}

export interface MessageToDisplay {
  message: MessageRecord,
}

export interface ExploreToDisplay {
  title: string;
  url: string;
  urlToImage: string;
}

export interface ExploreNewsSourceToDisplay {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
}

// New types based on the code snippets
export interface PersonalInfo {
  dateOfBirth?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
}

export interface PersonalInterests {
  hobbies?: string[];
  preferredMadhab?: 'Hanafi' | "Shafi'i" | 'Maliki' | 'Hanbali' | "Salafi";
  frequentMasjid?: string;
  favoriteQuranReciters?: string[];
  favoriteIslamicScholars?: string[];
  islamicStudyTopics?: string[];
}

// Relationship types
export interface PostedRelationship {
  timestamp: string;
}

export interface CommentedRelationship {
  timestamp: string;
}


export interface Neo4jConfig {
  maxConnectionPoolSize: number;
  connectionTimeout: number;
  disableLosslessIntegers: boolean;
}

declare module "next-auth" {
  export interface Session extends DefaultSession {
    user: {
      id: string
      username: string
      role: string
    } & DefaultSession["user"]
  }

  interface User extends AdapterUser {
    id: string
    username?: string
    role?: string
  }
}

