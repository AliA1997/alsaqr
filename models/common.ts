export interface Pagination {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export class PaginatedResult<T> {
  data: T;
  pagination: Pagination;

  constructor(data: T, pagination: Pagination) {
    this.data = data;
    this.pagination = pagination;
  }
}

export class PagingParams {
    currentPage: number = 1;
    itemsPerPage: number = 20;

    constructor(page?: number, limit?: number) {
        if (page)
            this.currentPage = page;

        if (limit)
            this.itemsPerPage = limit;
    }
}


export enum ActivityLogType {
  CreatedList = 'created-list',
  RemovedList = 'removed-list',
  SavedToList = 'saved-to-list',

  CreatedCommunity = 'created-community',
  CreatedCommunityDiscussion = 'created-community-discussion',
  CreatedCommunityDiscussionMessage = 'created-community-discussion-message',
  
  CreatedPost = 'created-post',
  RemovedPost = 'remove-post',
  LikedPost = 'liked-Post',
  BookmarkedPost = 'bookmarked-post',
  RepostedPost = 'reposted-post',
  FollowUser = 'follow-user',
  UnfollowUser = 'unfollow-user',

  CreatedComment = 'created-comment',
  RemovedComment = 'remove-post'
}

export interface ActivityLog {
  id: string;
  userId: string;
  entityTypeId: string;
  message: string;
  type: ActivityLogType;
  createdAt: string;
}

export enum ModalKeys {
  Login = 'login',
  CreateCommunity = 'create-community',
  CreateList = 'create-list',
  ContinueAccountSetup = 'continue-account-setup'
}