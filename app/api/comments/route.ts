// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextRequest, NextResponse } from "next/server";
import { Comment, CommentForm } from "../../../typings";
import { defineDriver, getUserIdFromSession, write } from "@utils/neo4j/neo4j";
import { extractQryParams } from "@utils/common";


async function POST_UPSERT_COMMENT(request: NextRequest) {
  const [onComment] = extractQryParams(request, ['onComment']);

  const { values: data }: { values: CommentForm } = await request.json();
  const driver = defineDriver();
  const session = driver.session();
  try {
    if (!data.text) throw new Error("Post requires text.");

    const authSessionUserId = await getUserIdFromSession(session);

    if (onComment) {
      await write(
        session,
        `
        MATCH (u:User {id: $userId}), (cmtCmt: Comment { id: $commentId })
        CREATE (u)-[:COMMENTED_ON_COMMENT]->(cmt:Comment {
          id: $id,
          postId: $postId,
          userId: $userId,
          text: $text,
          image: $image,
          createdAt: datetime(),
          updatedAt: null,
          _rev: '',
          _type: 'comment',
        })
        MERGE (cmt)-[:COMMENT_HAS_COMMENT]->(cmtCmt)
        `,
        {
          ...data,
          commentId: data.commentToCommentOnId,
          userId: authSessionUserId,
        }
      );
    } else {

      await write(
        session,
        `
        MATCH (u:User {id: $userId}), (post:Post { id: $postId })
        CREATE (u)-[:COMMENTED]->(cmt:Comment {
          id: $id,
          postId: $postId,
          userId: $userId,
          text: $text,
          image: $image,
          createdAt: datetime(),
          updatedAt: null,
          _rev: '',
          _type: 'comment'
        })
        CREATE (cmt)-[:COMMENT_ON]->(post)
        `,
        {
          ...data,
          userId: authSessionUserId,

        }
      );

      await write(
        session,
        `
          // Match commenting user
          MATCH (commentUser:User {id: $userId})
          // Match the post node 
          MATCH (post:Post {id: $postId})
          // Match the post author (fixed relationship direction)
          MATCH (author:User)-[:POSTED]->(post)
          // Create notification connected to author
          CREATE (author)-[:NOTIFIED_BY]->(n:Notification {
            id: "notification_" + randomUUID(),
            message: "Post commented by " + commentUser.username,
            read: false,
            relatedEntityId: post.id,
            link: "/status/" + post.id,
            createdAt: datetime(),
            updatedAt: null,
            _rev: null,
            _type: "notification",
            notificationType: "comment_on_post"
          })
            `,
        {
          userId: authSessionUserId,
          postId: data.postId
        }
      );

    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}

export { POST_UPSERT_COMMENT as POST };