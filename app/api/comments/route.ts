// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextRequest, NextResponse } from "next/server";
import { Comment } from "../../../typings";
import { defineDriver, write } from "@utils/neo4j/neo4j";


async function POST_UPSERT_COMMENT(request: NextRequest) {
  const { values:data }: { values: Comment } = await request.json();
  const driver = defineDriver();
  const session = driver.session();

  try {
    if (!data.text) throw new Error("Post requires text.");

    console.log("userID:", data.userId);
    await write(
      session,
      `
      MATCH (u:User {id: $userId}), (post: Post { id: $postId })
      CREATE (u)-[:COMMENTED]->(cmt:Comment {
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
      MERGE (cmt)-[:COMMENT_ON]->(post)
      `,
      { ...data }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}

export { POST_UPSERT_COMMENT as POST };