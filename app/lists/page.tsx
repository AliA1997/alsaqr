"use client";
import React, { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { observer } from "mobx-react-lite";
const ListFeed = dynamic(() => import("@components/shared/ListFeed"), { ssr: false });


export default observer(function ListsPage() {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  return <ListFeed />;
});
