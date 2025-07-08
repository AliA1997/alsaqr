"use client";
import React from "react";
import dynamic from 'next/dynamic';
import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import CustomPageLoader from "@components/common/CustomLoader";
const ExploreFeed = dynamic(() => import("@components/explore/ExploreFeed"), { ssr: false });


export default observer(function ExplorePage() {
  return (
    <React.Suspense fallback={<CustomPageLoader title='Loading...' />}>
      <ExploreFeed />
    </React.Suspense>
  );
});