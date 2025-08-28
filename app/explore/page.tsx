"use client";
import React from "react";
import dynamic from 'next/dynamic';
import { observer } from "mobx-react-lite";
import CustomPageLoader from "@components/common/CustomLoader";

const ExploreTabs = dynamic(() => import("@components/explore/ExploreTabs"), { ssr: false });


export default observer(function ExplorePage() {
  return (
    <React.Suspense fallback={<CustomPageLoader title='Loading...' />}>
      <ExploreTabs />
    </React.Suspense>
  );
});