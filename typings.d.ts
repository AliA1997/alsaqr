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
  Verified = "verified",
  YourAccount = "your_account",
  FollowUser = "follow_user",
  BookmarkedPost = 'bookmarked_post',
  LikedPost = 'liked_post',
  RePostedPost = 'reposted_post',
  CommentedPost = 'commented_post',
  NewList = "new_list",
  NewCommunity = "new_community",
  NewPost = "new_post",
}

export enum MessageType {
  All = "All",
  Sent = "Sent",
  Direct = "Direct"
}

export enum CommonUpsertBoxTypes {
  Post = "Post",
  List = "List",
  Community = "Community",
  UpdateCommunity = "Update-Community",
  CommunityDiscussion = "CommunityDiscussion",
  Register = "Register"
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
  following?: User[];
  followers?: User[];
}


export interface UserItemToDisplay {
  user: User;
  following?: User[];
  followers?: User[];
}

export interface UserRegisterFormDto extends UserRegisterForm {
  followingUsers: string[];
}

export interface UserRegisterForm extends UserInfo {
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  hobbies?: string[];
  religion?: string;
  countryOfOrigin?: string;
  followingUsers: UserItemToDisplay[];
}

export interface User extends UserInfo {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  geoId?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  hobbies?: string[];
  religion?: "Christian" | "Muslim" | "Atheist" | "Agnostic" | "Jew" | "Prefer Not To Disclose";
  preferredMadhab?: 'Hanafi' | "Shafi'i" | 'Maliki' | 'Hanbali' | "Salafi" | "Prefer Not To Disclose";
  frequentMasjid?: string;
  favoriteQuranReciters?: string[];
  favoriteIslamicScholars?: string[];
  islamicStudyTopics?: string[];
  followingUsers: string[];
  followedByUsers: string[];
  isCompleted: boolean;
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

export interface SavedPostItem {
  post: PostRecord,
  username: string;
  profileImg: string;
}

export interface PostRecord extends CommonRecordBody {
  id: string;
  createdAt: string;
  updatedAt: string;
  _rev: string;
  _type: "post";
  blockTweet: boolean;
  tags: string[];
  likes?: string[];
  userId?: string;
}

export interface CommentForm extends Comment {};

export interface Comment extends CommonRecordBody {
  id: string;
  postId: string;
  userId: string;
  image: string;
  text: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommentToDisplay extends Comment {
  username: string;
  profileImg: string;
}

export interface CreateListOrCommunityFormDto extends CreateListOrCommunityForm {
  usersAdded: string[];
  postsAdded: string[];
}

export interface CreateListOrCommunityForm {
  name: string;
  avatarOrBannerImage: string;
  isPrivate: "private" | "public";
  tags: string[];
  usersAdded: UserItemToDisplay[];
  postsAdded: PostToDisplay[];
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
  joinedUsersToDisplay: User[];
}

export interface CommunityRecordToDisplay extends CommunityRecord {
  founder: string;
  founderProfileImg: string;
}

export interface CommunityToDisplay {
  community: CommunityRecordToDisplay,
  founder: UserInfo,
  relationshipType: 'JOINED' | 'INVITED' | 'FOUNDER'
}

export interface CommunityAdminInfo {
  community: CommunityRecordToDisplay;
  isFounder: boolean;
  founder: UserInfo;
  invitedCount: number;
  joinedCount: number;
}
// CALL apoc.trigger.add('create_list_notification', 
// 'UNWIND $createdNodes AS node
//  WHERE labels(node)[0] = "List"
//  MATCH (owner:User)-[:OWNS]->(node)
//  CREATE (n:Notification {
//    id: apoc.text.format("notification_%s", [randomUUID()]),
//    message: "New list created by " + owner.username,
//    read: false,
//    relatedEntityId: node.id,
//     link: null,
//    createdAt: datetime(),
//    updatedAt: null,
//    _rev: null,
//    _type: "notification",
//    notificationType: "new_list"
//  })
//  CREATE (n)-[:NOTIFIES]->(owner)
//  RETURN count(*)', 
// {phase: 'after'})
export interface NotificationRecord extends CommonRecordBody {
  id: string;
  message: string;
  read: boolean;
  relatedEntityId?: string;
  link?: string;
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

// Direct Message Relationships
// Sender -> SEND_MESSAGE -> Recipient
// Recipient -> RECEIVED_MESSAGE -> Sender
export interface MessageFormDto extends CommonRecordBody {
  messageType: MessageType;
  senderId: string;
  senderProfileImg?: string;
  senderUsername?: string;
  recipientId?: string;
  recipientProfileImg?: string;
  recipientUsername?: string;
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

export interface MessageHistoryToDisplay {
  id: string;
  receiverId: string;
  receiverProfileImage: string
  receiverUsername: string;
  messageCount: any;
  lastMessageDate: any;
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

