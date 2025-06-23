// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { defineDriver, read, write } from "@utils/neo4j/neo4j";
import { NextRequest, NextResponse } from "next/server";

async function GET(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const driver = defineDriver();
  const session = driver.session();
  const { user_id } = params;
  const userId = user_id as string;
  console.log("USERNAME:", userId);
  if (!userId) {
    return new NextResponse("You need to be logged in, in order to access  your messages.", { status: 400 });
  }
  try {
    const bookmarks = await read(
                                session, 
                                `
                                MATCH (user:User {id: $userId})-[:BOOKMARKED]->(tweet:Post) RETURN tweet
                                `, 
                                { userId },
                                "tweet"
                            );

    console.log("bookmarks:", bookmarks);

    return NextResponse.json({ success: true, bookmarks });
  } catch (err) {
    return NextResponse.json({ message: "Get messages error!", success: false });
  }
}

export { GET };