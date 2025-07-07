import { defineDriver, getUserIdFromSession, read, write } from "@utils/neo4j/neo4j";
import { NextRequest, NextResponse } from "next/server";
import { CommentToDisplay } from "typings";


async function GET_COMMENT(
  request: NextRequest,
  { params }: { params: { comment_id: string } }
) {
  const { comment_id } = params;
  const commentId = comment_id as string;

  if (!commentId) {
    return new NextResponse("Comment ID is required", { status: 400 });
  }

  const driver = defineDriver();
  const session = driver.session();
  let success = false;
  let comment: CommentToDisplay | undefined = undefined;
  try {
    // Adjust the Cypher query to fetch the tweet by ID

    const comments = await read(
      session,
      `
        MATCH (c: Comment { id: $commentId })
        MATCH (u: User)-[:COMMENTED]->(c)
        OPTIONAL MATCH (c)-[:COMMENT_HAS_COMMENT]->(cmtCmt:Comment)<-[:COMMENTED_ON_COMMENT]-(cmtCmtUser:User)
        OPTIONAL MATCH (c)-[:COMMENT_REPOSTS]->(reposter:User)
        OPTIONAL MATCH (c)-[:COMMENT_LIKED]->(liker:User)
        with u.id as userId, 
            u.username as username,
            u.avatar as profileImg,
            COLLECT(DISTINCT cmtCmtUser) AS commenters,
            COLLECT(DISTINCT cmtCmt) AS comments,
            COLLECT(DISTINCT reposter) AS reposters,
            COLLECT(DISTINCT liker) AS likers,
            c

        RETURN c.id as id,
                c.postId as postId,
                userId as userId,
                c.image as image,
                c.text as text,
                c.createdAt as createdAt,
                username,
                profileImg,
                commenters,
                comments,
                reposters,
                likers
      `,
      { commentId },
      [
            "id", "postId", "userId", "image", "text", 
            "createdAt", "username", "profileImg",
            "commenters", "comments", "reposters", "likers"
        ]
    );

    console.log('comments:', comments)
    comment = comments ? comments[0] : undefined;

    if (!comment) {
      throw new Error(`Comment not found based on status id ${commentId}`);
    }

    success = true;
  } catch (err) {
    console.log("Error:", err);
    return NextResponse.json({ message: "Fetch Comment error!", success: false });
  } finally {
    session.close();
  }

  return NextResponse.json({ comment, success });
}


async function DELETE_COMMENT(
  request: NextRequest,
  { params }: { params: { comment_id: string } }
) {
  const { comment_id } = params;
  const commentId = comment_id as string;

  if (!commentId) {
    return new NextResponse("Comment ID is required", { status: 400 });
  }

  const driver = defineDriver();
  const session = driver.session();

  try {
    const userAuthSessionId = await getUserIdFromSession(session);
    if (!userAuthSessionId) {
        return new NextResponse("Only logged in user can delete comments", { status: 400 });   
    }

    await write(
      session,
      `
      MATCH (cmt: Comment { id: $commentId })
      WHERE cmt.userId = $userId
      DETACH DELETE cmt;
    `,
      {
        commentId,
        userId: userAuthSessionId
      }
    )
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "Delete Comment error!", success: false });

  }
}



export {
    GET_COMMENT as GET,
    DELETE_COMMENT as DELETE
};