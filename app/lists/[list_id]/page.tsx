'use client';
import React, { useEffect, useState } from "react";

import { observer } from "mobx-react-lite";
import SavedListItemsFeed from "@components/list/SavedListItemsFeed";
import { useStore } from "@stores/index";
import CustomPageLoader from "@components/common/CustomLoader";

interface ListPageProps {
  params: {
    list_id: string;
  };
}

const ListPage = ({ params }: ListPageProps) => {
  const { listFeedStore } = useStore();
  const { loadingListItems } = listFeedStore
  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    }
  }, []);

  if(!loadingListItems && mounted)
    return (
      <SavedListItemsFeed listId={params.list_id} />
    );
  
  return <CustomPageLoader title="Loading..." />
};


export default observer(ListPage);