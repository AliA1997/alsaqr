"use client";
import React from "react";
import ListOrCommunityFeed from "@components/shared/ListOrCommunityFeed";
import { FilterKeys } from "@stores/index";

function CommunitiesPage() {

  return <ListOrCommunityFeed filterKey={FilterKeys.Community} title="Communities" />
}

export default CommunitiesPage;
