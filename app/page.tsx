"use client";
import React, { useEffect } from "react";
import Feed from "app/components/Feed";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { User } from "typings";
import { Metadata } from "next";
import { FilterKeys, useStore } from "@stores/index";
import { observer } from "mobx-react-lite";

const Home = () => {  
  const { data: session } = useSession();
  const { authStore } = useStore();
  const router = useRouter();
  useEffect(() => {
    if (session && session.user) {
      authStore.setCurrentUser(session.user);
    } else {
      authStore.setCurrentUser(undefined);
    }
  }, [router, session]);

  return <Feed title="Popular Posts" filterKey={FilterKeys.Normal} />;
};

export default observer(Home);
