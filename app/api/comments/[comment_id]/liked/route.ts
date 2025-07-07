// app/api/tweets/[tweet_id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { defineDriver, getUserIdFromSession, read, write } from "@utils/neo4j/neo4j";
import { PostToDisplay } from "typings";
import { LikedCommentParams } from "models/posts";


async function PATCH_LIKED_COMMENT(
    request: NextRequest,
    { params }: { params: { comment_id: string } }
  ) {
  const { values:data }: { values:LikedCommentParams } = await request.json();
    
    const { comment_id } = params;
    const commentId = comment_id as string;
  
    if (!commentId) {
      return new NextResponse("Comment ID is required", { status: 400 });
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
          MERGE (cmtToLike:Comment {id: $commentId})
          // Create the 'LIKES_COMMENT' relationship with a timestamp
          MERGE (u)-[ur:LIKES_COMMENT]->(cmtToLike)
          MERGE (cmtToLike)-[cr:COMMENT_LIKED]->(u)
          ON CREATE SET ur.timestamp = timestamp()
          ON CREATE SET cr .timestamp = timestamp()
          `,
          { userId: data.userId, commentId }
        );

        await write(
          session,
          `
            // Match liking user
            MATCH (likingUser:User {id: $userId})
            // Match the comment node 
            MATCH (comment:Comment {id: $commentId})
            // Match the comment author (fixed relationship direction)
            MATCH (author:User)-[:COMMENTED]->(comment)
            // Create notification connected to author
            CREATE (author)-[:NOTIFIED_BY]->(n:Notification {
              id: "notification_" + randomUUID(),
              message: "Your comment liked by " + likingUser.username,
              read: false,
              relatedEntityId: comment.id,
              link: "/status/" + comment.id,
              createdAt: datetime(),
              updatedAt: null,
              _rev: null,
              _type: "notification",
              notificationType: "liked_comment"
            })
            `,
          { userId: data.userId, commentId }
        );
      
      } else if (data.liked) {
        console.log('delete relationship thing', data.liked)
        await write(
          session,
          `
          MATCH (u:User {id: $userId})-[lr:LIKES_COMMENT]->(cmt:Comment {id: $commentId})
          MATCH (cmt:Comment {id: $commentId})-[cl:COMMENT_LIKED]->(u:User {id: $userId})
          DELETE lr, cl
          `,
          { userId: data.userId, commentId }
        );

        await write(
          session,
          `
            // Match the liking user and post
            MATCH (likingUser:User {id: $userId})
            MATCH (cmt:Comment {id: $commentId})
            // Match the author who created the post
            MATCH (author:User)-[:COMMENTED]->(cmt)
            // Find and delete the specific notification
            MATCH (author)-[r:NOTIFIED_BY]->(n:Notification {
              relatedEntityId: cmt.id,
              notificationType: "liked_comment"
            })
            DELETE r, n
            `,
          { userId: data.userId, commentId }
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

export { PATCH_LIKED_COMMENT as PATCH };
