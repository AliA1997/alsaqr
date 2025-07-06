"use client";
import React from "react";
import dynamic from 'next/dynamic';
import { observer } from "mobx-react-lite";
const ExploreFeed = dynamic(() => import("@components/explore/ExploreFeed"), { ssr: false });


export default observer(function ExplorePage() {

  return (
    <React.Suspense fallback={<div>Exploring...</div>}>
      <ExploreFeed />
    </React.Suspense>
  );
});