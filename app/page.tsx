"use client";
import React, { useEffect } from "react";
import Feed from "app/components/Feed";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { User } from "typings";
import { Metadata } from "next";
import { FilterKeys } from "@stores/index";

const Home = () => {  
  const { data: session } = useSession();

  const router = useRouter();
  useEffect(() => {
    if (session && session.user) {
      router.prefetch(`/users/${(session.user as User).username}`);
      router.prefetch(`/communities`);
      router.prefetch(`/lists`);
    }
  }, [router, session]);

  return <Feed title="Popular Posts" filterKey={FilterKeys.Normal} />;
};

export default Home;
