// app/api/tweets/[tweet_id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { defineDriver, getUserIdFromSession, read, write } from "@utils/neo4j/neo4j";
import { PostToDisplay, ProfileUser } from "typings";
import { getServerSession } from "next-auth";

interface GetTweetResponse {
  tweet?: PostToDisplay,
  messge?: string;
  success: boolean;
}

async function GET_POST(
  request: NextRequest,
  { params }: { params: { tweet_id: string } }
): Promise<NextResponse<GetTweetResponse>> {
  const { tweet_id } = params;
  const tweetId = tweet_id as string;

  if (!tweetId) {
    return new NextResponse("Post ID is required", { status: 400 });
  }

  const driver = defineDriver();
  const session = driver.session();

  try {
    // Adjust the Cypher query to fetch the tweet by ID

    const posts = await read(
      session,
      `
        MATCH (post:Post { id: $tweetId }), (user: User { id: post.userId })
        OPTIONAL MATCH (post)<-[:COMMENT_ON]-(c:Comment)<-[:COMMENTED]-(u:User)
        OPTIONAL MATCH (post)<-[:REPOSTED]-(reposter:User)
        OPTIONAL MATCH (post)<-[:LIKES]-(liker:User)
        WITH post,
            user.username as username,
            user.avatar as profileImg,
            COLLECT(DISTINCT c) AS comments,
            COLLECT(DISTINCT u) AS commenters,
            COLLECT(DISTINCT reposter) AS reposters,
            COLLECT(DISTINCT liker) AS likers
        RETURN post,
              username,
              profileImg,
              comments,
              commenters,
              reposters,
              likers
        LIMIT 100
      `,
      { tweetId },
      ["post", "username", "profileImg", "comments", "commenters", "reposters", "likers"]
    );

    const post = posts ? posts[0] : undefined;

    if (post) {
      return NextResponse.json({ post, success: true });
    } else {
      throw new Error(`Post not found based on status id ${tweetId}`);
    }
  } catch (err) {
    return NextResponse.json({ message: "Fetch Post error!", success: false });

  }
}


async function DELETE_POST(
  request: NextRequest,
  { params }: { params: { tweet_id: string } }
): Promise<NextResponse<GetTweetResponse>> {
  const { tweet_id } = params;
  const tweetId = tweet_id as string;

  if (!tweetId) {
    return new NextResponse("Post ID is required", { status: 400 });
  }

  const driver = defineDriver();
  const session = driver.session();

  try {
    const userAuthSessionId = await getUserIdFromSession(session);
    if (!userAuthSessionId) {
        return new NextResponse("Only logged in user can delete posts", { status: 400 });   
    }

    await write(
      session,
      `
      MATCH (pst: Post { id: $tweetId })
      WHERE pst.userId = $userId
      DETACH DELETE pst;
    `,
      {
        tweetId,
        userId: userAuthSessionId
      }
    )
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "Delete Post error!", success: false });

  }
}


export {
  GET_POST as GET,
  DELETE_POST as DELETE
};

