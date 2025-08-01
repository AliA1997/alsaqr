// app/api/tweets/[tweet_id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { defineDriver, getUserIdFromSession, read, write } from "@utils/neo4j/neo4j";
import { LikedPostParams } from "models/posts";


async function PATCH_LIKED_POST(
    request: NextRequest,
    { params }: { params: { tweet_id: string } }
  ) {
    const { values:data }: { values:LikedPostParams } = await request.json();
  
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


      if (!data.liked) {
        await write(
          session,
          `
          // Match the user node
          MERGE (u:User {id: $userId})
          // Match the tweet node
          MERGE (post:Post {id: $tweetId})
          // Create the 'LIKES' relationship with a timestamp
          MERGE (u)-[ur:LIKES]->(post)
          MERGE (post)-[postRel:LIKED]->(u)
          ON CREATE SET ur.timestamp = timestamp()
          ON CREATE SET postRel.timestamp = timestamp()
          `,
          { userId: data.userId, tweetId: tweet_id }
        );

        await write(
          session,
          `
            // Match liking user
            MATCH (likingUser:User {id: $userId})
            // Match the post node (fixed variable name from pst to post for consistency)
            MATCH (post:Post {id: $tweetId})
            // Match the post author (fixed relationship direction)
            MATCH (author:User)-[:POSTED]->(post)
            // Create notification connected to author
            CREATE (author)-[:NOTIFIED_BY]->(n:Notification {
              id: "notification_" + randomUUID(),
              message: "Post liked by " + likingUser.username,
              read: false,
              relatedEntityId: post.id,
              link: "/status/" + post.id,
              createdAt: datetime(),
              updatedAt: null,
              _rev: null,
              _type: "notification",
              notificationType: "liked_post"
            })
            `,
          { userId: data.userId, tweetId: tweet_id }
        );
      
      } else if (data.liked) {
        await write(
          session,
          `
          // Match the user, tweet, and the 'LIKES' relationship
          MATCH (u:User {id: $userId})-[r:LIKES]->(post:Post {id: $tweetId})
          MATCH (post:Post {id: $tweetId})-[tr:LIKED]->(u:User {id: $userId})
          DELETE r, tr
          `,
          { userId: data.userId, tweetId: tweet_id }
        );

        await write(
          session,
          `
            // Match the liking user and post
            MATCH (likingUser:User {id: $userId})
            MATCH (post:Post {id: $tweetId})
            // Match the author who created the post
            MATCH (author:User)-[:POSTED]->(post)
            // Find and delete the specific notification
            MATCH (author)-[r:NOTIFIED_BY]->(n:Notification {
              relatedEntityId: post.id,
              notificationType: "liked_post"
            })
            DELETE r, n
            `,
          { userId: data.userId, tweetId: tweet_id }
        );
      }
      success = true;
    } catch (err) {
      console.log('error', err);
      return NextResponse.json({ message: "Patch Post error!", success: false });
    } finally {
      session.close();
    }

    
      return NextResponse.json({ success });
  }

export { PATCH_LIKED_POST as PATCH };
