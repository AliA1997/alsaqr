// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { defineDriver, read, write } from "@utils/neo4j/neo4j";
import { NextRequest, NextResponse } from "next/server";

/** TODO: NEED TO COMPLETE LIST Get, Post, and Put functionality. */
async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  const driver = defineDriver();
  const session = driver.session();
  const { name } = params;
  const username = name as string;

  if (!username) {
    return new NextResponse("You need to be logged in, in order to access  your bookmarks.", { status: 400 });
  }
  try {
    const lists = await read(
                                session, 
                                `
                                MATCH (user:User {username: $username})-[:BOOKMARKED]->(tweet:Post) RETURN tweet
                                `, 
                                { username },
                                "tweet"
                            );

    console.log("bookmarks:", lists);

    return NextResponse.json({ success: true, lists });
  } catch (err) {
    return NextResponse.json({ message: "Add bookmarks error!", success: false });
  }
}

export { GET };