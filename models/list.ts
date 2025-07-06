import { CommunityRecordToDisplay, CommunityToDisplay, ListToDisplay, PostRecord, PostToDisplay, SavedPostItem, UserItemToDisplay } from "typings";
import { CommunityDiscussionMessageToDisplay, CommunityDiscussionToDisplay } from "./community";

export enum ListItemType {
    Post = 'post',
    User = 'user',
    Community = 'community',
    CommunityDiscussion = 'community-discussion',
    CommunityDiscussionMessage = 'community-discussion-message',
    List = 'list'
}
// Relationship when posting is 
// list - [:SAVED_LIST_ITEM] -> list item
// listItem - [:SAVED_TO_LIST] -> list
export interface ListItem {
    id: string;
    savedUserId?: string;
    postId?: string;
    commmunityId?: string;
    communityDiscussionId?: string;
    communityDiscussionMessageId?: string;
    listId?: string;
    listItemType: ListItemType;
    savedAt: string;
}

export interface ListItemRecord extends ListItem {}

export interface ListItemToDisplay {
  listItem: ListItem;
  relatedEntity: any;
  label: "Post" | "Community" | "Community Discussion" | "Community Discussion Message" | "List" | "User";
}