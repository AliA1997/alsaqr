// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { defineDriver, read, write } from "@utils/neo4j/neo4j";
import { NextRequest, NextResponse } from "next/server";

/** TODO: NEED TO COMPLETE LIST Get, Post, and Put functionality. */
async function GET(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const driver = defineDriver();
  const session = driver.session();
  const { user_id } = params;
  const userId = user_id as string;

  if (!userId) {
    return new NextResponse("You need to be logged in, in order to access  your lists.", { status: 400 });
  }
  try {
    const lists = await read(
                                session, 
                                `
                                MATCH (user:User {id: $userId})-[:BOOKMARKED]->(tweet:Post) RETURN tweet
                                `, 
                                { userId },
                                "tweet"
                            );

    console.log("lists:", lists);

    return NextResponse.json({ success: true, lists });
  } catch (err) {
    return NextResponse.json({ message: "Get lists error!", success: false });
  }
}

export { GET };