'use client';
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { FilterKeys, useStore } from "@stores/index";
import { CommunityAdminInfo, CommunityToDisplay } from "typings";
import { communityApiClient } from "@utils/communityApiClient";
import CommunityAdminView from "@components/community/CommunityAdminView";
import CommunityDiscussionFeedStore from "@stores/communityDiscussionFeedStore";
import CustomPageLoader from "@components/common/CustomLoader";
const ListOrCommunityFeed = dynamic(() =>  import("@components/shared/ListOrCommunityFeed"), { ssr: false });

interface CommunityItemPageProps {
  params: {
    community_id: string;
  };
}

const CommunityItemPage = observer(({ params }: CommunityItemPageProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const { authStore, communityDiscussionFeedStore } = useStore();
  const { loadingInitial:feedLoading } = communityDiscussionFeedStore;
    const { currentSessionUser } = authStore;
    const [communityInfo, setCommunityInfo] = useState<CommunityAdminInfo | undefined>(undefined);
    
    async function getCommunityInfo() {
        const communityInfoResult = await communityApiClient
                                .getAdminCommunityInfo(undefined, currentSessionUser?.id!, params.community_id);
        
        setCommunityInfo(communityInfoResult);
        setLoading(false);
    }

    async function refreshCommunityInfo(communityId: string) {
        const communityInfoResult = await communityApiClient
                                      .getAdminCommunityInfo(undefined, currentSessionUser?.id!, communityId);
        
        setCommunityInfo(communityInfoResult);
        setLoading(false);
    }

    useEffect(
        () => {
        
        if(currentSessionUser?.id)
            getCommunityInfo();
        },
        [currentSessionUser]
    );

  if(loading)
    return <CustomPageLoader title="Loading" />
  else
    return (
      <>
        {communityInfo?.isFounder && (
          <CommunityAdminView 
            communityAdminInfo={communityInfo!}
            refreshCommunityAdminInfo={refreshCommunityInfo}
          />
        )}
        <ListOrCommunityFeed 
            filterKey={FilterKeys.CommunityDiscussion}
            title="Community Discussions"
            communityId={params.community_id}
        />
      </>
    );
});


export default CommunityItemPage;