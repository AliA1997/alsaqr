"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { PageTitle } from "@components/common/Titles";
const NotificationTabs = dynamic(() => import("../components/notification/NotificationTabs"), { ssr: false });

async function NotificationsPage() {
  const topic = "Notifications";
  
  return (
    <>
      <PageTitle>Notifications</PageTitle>
      <NotificationTabs />
    </>
  );
};

export default NotificationsPage;
