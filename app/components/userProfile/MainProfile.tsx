"use client";
import React, { useCallback, useLayoutEffect, useState } from "react";
import dynamic from 'next/dynamic';
import type {
  DashboardPostToDisplay,
} from "../../../typings";

import { useParams } from "next/navigation";
import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";

const CustomPageLoader = dynamic(() => import("@components/common/CustomLoader"), { ssr: false });
const Tabs = dynamic(() => import( "@components/common/Tabs"), { ssr: false });
const PostComponent = dynamic(() => import("../posts/Post"), { ssr: false });

import type { Session } from "next-auth";
import { getSession } from "next-auth/react";
import UserHeader from "./UserHeader";


const MainProfile = () => {
  const { userStore } = useStore();
  const { 
    loadProfile, 
    currentUserProfile, 
    loadProfilePosts, 
    currentUserProfilePosts,
    loadingPosts
  } = userStore;
  const params = useParams();
  const { name } = params;
  const username = name as string;
  const [currentSession, setCurrentSession] = useState<Session | undefined>(undefined);


  async function refreshProfileInfo() {
    await loadProfile(username);
  }

  useLayoutEffect(() => {
    async function getProfileInfo() {
      getSession()
        .then(currentSessionResult => {
          setCurrentSession(currentSessionResult ?? undefined);
          return loadProfile(username)
        })
        .then(async ({ user }) => {
          await loadProfilePosts(user.id);
        })
      
    }

    getProfileInfo();
  }, []);

  // const [user] = useAuthState(auth);
  // const router = useRouter();
  const renderer = useCallback(
    (postToDisplay: DashboardPostToDisplay) => (
      <PostComponent
        key={postToDisplay.post.id}
        postToDisplay={postToDisplay}
      />
    ),
    []
  );

  if(currentUserProfile) 
    return (
      <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
        <div>
          {currentUserProfile && (
            <>
              <UserHeader
                currentSession={currentSession}
                refreshProfileInfo={refreshProfileInfo}
                profileInfo={currentUserProfile}
                numberOfPosts={currentUserProfilePosts?.userPosts?.length ?? 0}
                followerCount={currentUserProfile.followers?.length ?? 0}
                followingCount={currentUserProfile.following?.length ?? 0}
              />
              {/* <React.Suspense fallback={<h2>Loading...</h2>}> */}
                <Tabs
                  tabs={[
                    {
                      tabKey: "recent",
                      title: "Recent",
                      content: currentUserProfilePosts?.userPosts ?? [],
                      renderer,
                      noRecordsContent: 'No posts'
                    },
                    {
                      tabKey: "reposts",
                      title: "Reposts",
                      content: currentUserProfilePosts?.repostedPosts ?? [],
                      renderer,
                      noRecordsContent: 'No reposts found'
                    },
                    {
                      tabKey: "bookmarks",
                      title: "Bookmarks",
                      content: currentUserProfilePosts?.bookmarkedPosts ?? [],
                      renderer,
                      noRecordsContent: `No bookmarks found`
                    },
                    {
                      tabKey: "replied-posts",
                      title: "Replies",
                      content: currentUserProfilePosts?.repliedPosts ?? [],
                      renderer,
                      noRecordsContent: `No replied posts found`
                    },
                    {
                      tabKey: "liked-posts",
                      title: "Liked Posts",
                      content: currentUserProfilePosts?.likedPosts ?? [],
                      renderer,
                      noRecordsContent: `No liked posts found`
                    },
                  ]}
                  loading={loadingPosts}
                />
              {/* </React.Suspense> */}
            </>
          )}
        </div>
      </div>
  );

  return <CustomPageLoader title="Loading..." />;

};
export default observer(MainProfile);
