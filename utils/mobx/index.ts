import { FilterKeys } from "@stores/index";
import CommunityFeedStore from "@stores/communityFeedStore";
import ExploreStore from "@stores/exploreStore";
import FeedStore from "@stores/feedStore";
import ListFeedStore from "@stores/listFeedStore";
// import SearchStore from "@stores/searchStore";
import { Params } from "@utils/neo4j";
import { PagingParams } from "models/common";
import BookmarkFeedStore from "@stores/bookmarkFeedStore";

export const loadData = async (
  storeToUse: FeedStore | ListFeedStore | CommunityFeedStore,
  userId?: string
) => {
  if (storeToUse instanceof FeedStore)
    await storeToUse.loadPosts();
  else if (storeToUse instanceof ListFeedStore)
    await storeToUse.loadLists(userId!);
  else if (storeToUse instanceof CommunityFeedStore)
    await storeToUse.loadCommunities(userId!);
};


export const setFilterState = (
  stores: [BookmarkFeedStore, FeedStore, ExploreStore],
  filterKey: FilterKeys,
  params: Params
) => {
  if (filterKey === FilterKeys.Explore){
    stores[1].setPagingParams(new PagingParams(params.currentPage, params.itemsPerPage));
    stores[1].setPredicate("searchTerm", params.searchTerm);
  }
  else if (filterKey === FilterKeys.MyBookmarks){
    stores[1].setPagingParams(new PagingParams(params.currentPage, params.itemsPerPage));
    stores[1].setPredicate("searchTerm", params.searchTerm);
  }
  else {
    stores[0].setPagingParams(new PagingParams(params.currentPage, params.itemsPerPage));
    stores[0].setPredicate("searchTerm", params.searchTerm);
  }
};
