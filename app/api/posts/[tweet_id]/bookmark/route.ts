// app/api/tweets/[tweet_id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { defineDriver, read, write } from "@utils/neo4j/neo4j";
import { PostToDisplay } from "typings";
import { BookmarkParams } from "models/posts";

async function PATCH_BOOKMARKED_POST(
  request: NextRequest,
  { params }: { params: { tweet_id: string } }
) {
  const { values:data }: { values:BookmarkParams } = await request.json();
  const { tweet_id } = params;
  const tweetId = tweet_id as string;

  if (!tweetId) {
    return new NextResponse("Post ID is required", { status: 400 });
  }

  const driver = defineDriver();
  const session = driver.session();
  let success = false;

  try {
    if (!data.bookmarked) {
      await write(
        session,
        `
            // Match the user node
            MERGE (u:User {id: $userId})
            // Match the tweet node
            MERGE (t:Post {id: $tweetId})
            // Create the 'BOOKMARKED' relationship with a timestamp
            MERGE (u)-[r:BOOKMARKED]->(t)
            ON CREATE SET r.timestamp = timestamp()
        `,
        { userId: data.userId, tweetId: tweet_id }
      );

      
      await write(
        session,
        `
          // Match bookmarking user
          MATCH (bookmarkingUser:User {id: $userId})
          // Match the post node (fixed variable name from pst to post for consistency)
          MATCH (post:Post {id: $tweetId})
          // Match the post author (fixed relationship direction)
          MATCH (author:User)-[:POSTED]->(post)
          // Create notification connected to author
          CREATE (author)-[:NOTIFIED_BY]->(n:Notification {
            id: "notification_" + randomUUID(),
            message: "Post bookmarked by " + bookmarkingUser.username,
            read: false,
            relatedEntityId: post.id,
            link: "/status/" + post.id,
            createdAt: datetime(),
            updatedAt: null,
            _rev: null,
            _type: "notification",
            notificationType: "bookmarked_post"
          })
          `,
        { userId: data.userId, tweetId: tweet_id }
      );

    } else if (data.bookmarked) {
      await write(
        session,
        `
        MATCH (u:User {id: $userId})-[r:BOOKMARKED]->(t:Post {id: $tweetId})
        DELETE r
        `,
        { userId: data.userId, tweetId: tweet_id }
      );

      await write(
        session,
        `
          // Match the bookmarking user and post
          MATCH (bookmarkingUser:User {id: $userId})
          MATCH (post:Post {id: $tweetId})
          // Match the author who created the post
          MATCH (author:User)-[:POSTED]->(post)
          // Find and delete the specific notification
          MATCH (author)-[r:NOTIFIED_BY]->(n:Notification {
            relatedEntityId: post.id,
            notificationType: "bookmarked_post"
          })
          DELETE r, n
          `,
        { userId: data.userId, tweetId: tweet_id }
      );
    }

    success = true;
  } catch (err) {
    return NextResponse.json({ message: "Patch Post error!", success: false });
  } finally {
    session.close();
  }
  return NextResponse.json({ success });
}

export { PATCH_BOOKMARKED_POST as PATCH };
