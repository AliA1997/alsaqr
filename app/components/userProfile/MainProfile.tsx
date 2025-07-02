"use client";
import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  DashboardPostToDisplay,
} from "../../../typings";
import UserHeader from "./UserHeader";
import { useParams } from "next/navigation";
import Tabs from "@components/common/Tabs";
import CustomPageLoader  from "@components/common/CustomLoader";
import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import PostComponent from "../posts/Post";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";


const MainProfile = () => {
  // const { data: session } = useSession();
  const { userStore } = useStore();
  const { loadProfile, currentUserProfile, loadProfilePosts, currentUserProfilePosts } = userStore;
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

  if(!currentUserProfile) {
    return <CustomPageLoader title="Loading..." />;
  }

  // console.log('currentUserProfilePosts', JSON.stringify(currentUserProfilePosts));

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
            <React.Suspense fallback={<h2>Loading...</h2>}>
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
              />
            </React.Suspense>
          </>
        )}
      </div>
      {/* <div>
        {tweets.map((tweet) => (
          <div key={tweet.id}>
            {tweet.username === userName && (
              <TweetComponents
                tweet={tweet}
                userId={user ? (user as any)['id'] : ""}
                setUserPName={setUserPName}
                userName={userName}
                setUserPhotoUrl={setUserPhotoUrl}
                pushNote={false}
              />
            )}
          </div>
        ))}
      </div> */}
    </div>
  );
};
export default observer(MainProfile);
