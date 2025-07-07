// app/api/tweets/[tweet_id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { defineDriver, getUserIdFromSession, read, write } from "@utils/neo4j/neo4j";
import { RePostParams } from "models/posts";

async function PATCH_REPOST_POST(
  request: NextRequest,
  { params }: { params: { tweet_id: string } }
) {
  const { values:data }: { values:RePostParams } = await request.json();
  
  const { tweet_id } = params;
  const tweetId = tweet_id as string;

  if (!tweetId) {
    return new NextResponse("Post ID is required", { status: 400 });
  }

  const driver = defineDriver();
  const session = driver.session();
  
  let success = false;
 
  try {
     const authUserSessionId = await getUserIdFromSession(session);

      if(authUserSessionId != data.userId) 
        throw Error("Must be logged in to like comments");


    if (!data.reposted) {
      await write(
        session,
        `
          // Match the user node
          MERGE (u:User {id: $userId})
          // Match the tweet node
          MERGE (t:Post {id: $tweetId})
          // Create the 'BOOKMARKED' relationship with a timestamp
          MERGE (u)-[ur:REPOSTED]->(t)
          MERGE (t)-[tr:RETWEETS]->(u)
          ON CREATE SET ur.timestamp = timestamp()
          ON CREATE SET tr.timestamp = timestamp()
        `,
        { userId: data.userId, tweetId: tweet_id }
      );

      await write(
        session,
        `
          // Match reposting user
          MATCH (repostingUser:User {id: $userId})
          // Match the post node (fixed variable name from pst to post for consistency)
          MATCH (post:Post {id: $tweetId})
          // Match the post author (fixed relationship direction)
          MATCH (author:User)-[:POSTED]->(post)
          // Create notification connected to author
          CREATE (author)-[:NOTIFIED_BY]->(n:Notification {
            id: "notification_" + randomUUID(),
            message: "Post reposted by " + repostingUser.username,
            read: false,
            relatedEntityId: post.id,
            link: "/status/" + post.id,
            createdAt: datetime(),
            updatedAt: null,
            _rev: null,
            _type: "notification",
            notificationType: "reposted_post"
          })
          `,
        { userId: data.userId, tweetId: tweet_id }
      );

    } else if (data.reposted) {
      await write(
        session,
        `
          MATCH (u:User {id: $userId})-[repostedRel:REPOSTED]->(t:Post {id: $tweetId})
          MATCH (u:Post {id: $tweetId})-[retweetsRel:RETWEETS]->(u:User {id: $userId})
          DELETE repostedRel, retweetsRel
        `,
        { userId: data.userId, tweetId: tweet_id }
      );

      
      await write(
        session,
        `
          // Match the reposting user and post
          MATCH (repostingUser:User {id: $userId})
          MATCH (post:Post {id: $tweetId})
          // Match the author who created the post
          MATCH (author:User)-[:POSTED]->(post)
          // Find and delete the specific notification
          MATCH (author)-[r:NOTIFIED_BY]->(n:Notification {
            relatedEntityId: post.id,
            notificationType: "reposted_post"
          })
          DELETE r, n
          `,
        { userId: data.userId, tweetId: tweet_id }
      );
    }

    success = true;
  } catch (err) {
    console.log("ERROR:", err)
    return NextResponse.json({ message: "Patch Post error!", success: false });
  } finally {
    session.close();
  }
  return NextResponse.json({ success });
}

export {  PATCH_REPOST_POST as PATCH };
