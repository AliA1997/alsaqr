"use client";
import React from "react";
import dynamic from 'next/dynamic';
const CommunityFeed = dynamic(() => import("@components/shared/CommunityFeed"), { ssr: false });

function CommunitiesPage() {
  
  return <CommunityFeed />
}

export default CommunitiesPage;
