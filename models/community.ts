// Relationship when posting is 
// user - [:CREATED_DISCUSSION]-> CommunityDiscussion
// community - [:DISCUSSION_POSTED] -> CommunityDiscussion

import { CommunityRecord, User } from "typings";

// communityDiscussion - [:POSTED_DISCUSSION_ON] -> community
export interface CommunityDiscussion {
    id: string;
    userId: string;
    communityId: string;
    name: string;
    createdAt: string;
    lastMessagedAt: string;
    _type: "community_discussion";
    tags: string[];
    isPrivate: boolean;
}

export interface CommunityDiscussionRecord extends CommunityDiscussion {

}

export interface CommunityDiscussionInfoForMessageRoom {
  communityDiscussion: CommunityDiscussionRecord;
  community: CommunityRecord;
  invitedUsers: User[];
  joinedUsers: User[];
}

export interface CommunityDiscussionToDisplay {
  communityDiscussion: CommunityDiscussionRecord;
  invitedUsers: User[];
  joinedUsers: User[];
}

// Relationship when posting is 
// user - [:POST_DISCUSSION_MESSAGE]-> CommunityDiscussionMessage
// communityDiscussion - [:DISCUSSION_MESSAGE_POSTED] -> CommunityDiscussionMessage
// communtyDiscussionMessage - [:DISCUSSION_MESSAGED_ON] -> CommunityDiscussion
export interface CommunityDiscussionMessage {
    id: string;
    userId: string;
    communityDiscussionId: string;
    communityId: string;
    messageText: string;
    image: string;
    createdAt: string;
    _type: "community_discussion_message";
    tags: string[];
}

export interface CommunityDiscussionMessageDto {
  userId: string;
  communityDiscussionId: string;
  communityId: string;
  messageText: string;
  image: string;
  _type: "community_discussion_message";
  tags: string[];
}

export interface CommunityDiscussionMessageRecord extends CommunityDiscussionMessage {}

export interface CommunityDiscussionMessageToDisplay {
  username: string;
  profileImg: string;
  communityDiscussionMessage: CommunityDiscussionMessageRecord;
}