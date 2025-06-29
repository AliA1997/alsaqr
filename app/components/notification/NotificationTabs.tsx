"use client";
import { useCallback, useState } from "react";
import Tabs from "@components/common/Tabs";
import { PostToDisplay } from "typings";
import TweetComponent from "../posts/Post";

export enum NotificationTabs {
  All = "All",
  Verified = "Verified",
  Mentions = "Mentions",
}

const NotificationTabsComponent = () => {
  const renderer = useCallback(
    (twt: PostToDisplay) => (
      <TweetComponent
        key={twt.post.id}
        postToDisplay={twt}
      />
    ),
    []
  );

  return (
    <Tabs
      tabs={[
        {
          tabKey: "all",
          title: "All",
          content: [],
          renderer,
          noRecordsContent: 'You have no notifications'
        },
        {
          tabKey: "mentioned",
          title: "Mentions",
          content: [],
          renderer,
          noRecordsContent: 'You have no mentioned notifications'
        },
        {
          tabKey: "verified",
          title: "Verified",
          content: [],
          renderer,
          noRecordsContent: 'You have no verified notifications'
        },
      ]}
      showNumberOfRecords={true}
    />
  );
};

export default NotificationTabsComponent;
