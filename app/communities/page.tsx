"use client";
import React from "react";
import dynamic from 'next/dynamic';
const ListOrCommunityFeed = dynamic(() => import("@components/shared/ListOrCommunityFeed"), { ssr: false });

import { FilterKeys } from "@stores/index";

function CommunitiesPage() {

  return <ListOrCommunityFeed filterKey={FilterKeys.Community} title="Communities" />
}

export default CommunitiesPage;
