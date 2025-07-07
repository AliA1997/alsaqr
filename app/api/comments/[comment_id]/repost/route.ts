// app/api/tweets/[tweet_id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { defineDriver, getUserIdFromSession, read, write } from "@utils/neo4j/neo4j";
import { PostToDisplay } from "typings";
import { RePostCommentParams } from "models/posts";

async function PATCH_REPOST_COMMENT(
  request: NextRequest,
  { params }: { params: { comment_id: string } }
) {
  const { values:data }: { values:RePostCommentParams } = await request.json();

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


    if (!data.reposted) {
      await write(
        session,
        `
          // Match the user node
          MERGE (u:User {id: $userId})
          // Match the tweet node
          MERGE (cmt:Comment {id: $commentId})
          // Create the 'REPOSTED_COMMENT' relationship with a timestamp
          MERGE (u)-[ur:REPOSTED_COMMENT]->(cmt)
          MERGE (cmt)-[cr:COMMENT_REPOSTS]->(u)
          ON CREATE SET ur.timestamp = timestamp()
          ON CREATE SET cr.timestamp = timestamp()
        `,
        { userId: data.userId, commentId }
      );

      await write(
        session,
        `
          // Match reposting user
          MATCH (repostingUser:User {id: $userId})
          // Match the comment node 
          MATCH (cmt:Comment {id: $commentId})
          // Match the comment author (fixed relationship direction)
          MATCH (author:User)-[:COMMENTED]->(cmt)
          // Create notification connected to author
          CREATE (author)-[:NOTIFIED_BY]->(n:Notification {
            id: "notification_" + randomUUID(),
            message: "Comment reposted by " + repostingUser.username,
            read: false,
            relatedEntityId: cmt.id,
            link: "/status/" + cmt.id,
            createdAt: datetime(),
            updatedAt: null,
            _rev: null,
            _type: "notification",
            notificationType: "reposted_comment"
          })
          `,
        { userId: data.userId, commentId }
      );

    } else if (data.reposted) {
      
      await write(
        session,
        `
          MATCH (u:User {id: $userId})-[repostedRel:REPOSTED_COMMENT]->(cmt:Comment {id: $commentId})
          MATCH (cmt:Comment {id: $commentId})-[commentRepostsRel:COMMENT_REPOSTS]->(u:User {id: $userId})
          DELETE repostedRel, commentRepostsRel
        `,
        { userId: data.userId, commentId }
      );

      
      await write(
        session,
        `
          // Match the reposting user and comment
          MATCH (repostingUser:User {id: $userId})
          MATCH (cmt:Comment {id: $commentId})
          // Match the author who created the comment
          MATCH (author:User)-[:COMMENTED]->(cmt)
          // Find and delete the specific notification
          MATCH (author)-[r:NOTIFIED_BY]->(n:Notification {
            relatedEntityId: cmt.id,
            notificationType: "reposted_comment"
          })
          DELETE r, n
          `,
        { userId: data.userId, commentId }
      );
    }

    success = true;
  } catch (err) {
    return NextResponse.json({ message: "Patch Comment error!", success: false });
  } finally {
    session.close();
  }
  return NextResponse.json({ success });
}

export {  PATCH_REPOST_COMMENT as PATCH };
