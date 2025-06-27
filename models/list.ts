import { CommunityToDisplay, ListToDisplay, PostToDisplay } from "typings";
import { CommunityDiscussionMessageToDisplay, CommunityDiscussionToDisplay } from "./community";

export enum ListItemType {
    Post = 'post',
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
  relatedEntity: PostToDisplay | CommunityToDisplay | CommunityDiscussionToDisplay | CommunityDiscussionMessageToDisplay | ListToDisplay;
}