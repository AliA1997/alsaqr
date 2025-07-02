'use client';
import React, { useEffect, useMemo, useState } from "react";

import { observer } from "mobx-react-lite";
import CommunityDiscussionMessageRoom from "@components/community/CommunityDiscussionMessageRoom";
import { useSession } from "next-auth/react";

interface CommunityDiscussionForumPageProps {
  params: {
    community_id: string;
    community_discussion_id: string;
  };
}

const CommunityDiscussionForumPage = ({ params }: CommunityDiscussionForumPageProps) => {
    const {data:session} = useSession();
    
    if(session && session.user)
      return <CommunityDiscussionMessageRoom 
                loggedInUser={session?.user!}
                communityDiscussionId={params.community_discussion_id}
                communityId={params.community_id}
              />
    else
      return  (
        <div>You need to be logged in to access this chat.</div>
      );
//   return (
//     <ListOrCommunityFeed 
//         filterKey={FilterKeys.CommunityDiscussion}
//         title="Community Discussions"
//         communityId={params.community_discussion_id}
//     />
//   );
};


export default observer(CommunityDiscussionForumPage);