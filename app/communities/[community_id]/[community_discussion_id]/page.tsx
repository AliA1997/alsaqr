'use client';
import React, { useEffect, useMemo, useState } from "react";

import { observer } from "mobx-react-lite";
import CommunityDiscussionMessageRoom from "@components/community/CommunityDiscussionMessageRoom";
import { useStore } from "@stores/index";
import CustomPageLoader from "@components/common/CustomLoader";

interface CommunityDiscussionForumPageProps {
  params: {
    community_id: string;
    community_discussion_id: string;
  };
}

const CommunityDiscussionForumPage = ({ params }: CommunityDiscussionForumPageProps) => {
    const [mounted, setMounted] = useState<boolean>(false);
    const {authStore} = useStore();
    const { currentSessionUser } = authStore;

    useEffect(() => {
      setMounted(true);

      () => {
        setMounted(false);
      }
    }, [])
    
    if(currentSessionUser)
      return <CommunityDiscussionMessageRoom 
                loggedInUser={currentSessionUser!}
                communityDiscussionId={params.community_discussion_id}
                communityId={params.community_id}
              />
    else if(mounted)
      return  (
        <div>You need to be logged in to access this chat.</div>
      );
    else
      return <CustomPageLoader title="Loading..." />

};


export default observer(CommunityDiscussionForumPage);