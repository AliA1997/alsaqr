// app/api/tweets/[tweet_id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { defineDriver, read } from "@utils/neo4j/neo4j";
import { ProfileUser } from "typings";

async function GET(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const { user_id } = params;
  const userId = user_id as string;

  if (!userId) {
    return new NextResponse("User ID is required", { status: 400 });
  }

  const driver = defineDriver();
  const session = driver.session();

  try {
    // Adjust the Cypher query to fetch the tweet by ID

    const users = await read(
      session,
      `
        MATCH (user:User {id: $userId})
        OPTIONAL MATCH (user)-[:BOOKMARKED]->(bookmark:Post)
        RETURN user,
              COLLECT(DISTINCT bookmark.id) AS bookmarks
      `,
      { userId },
      ["user", 'bookmarks']
    );
    const user: ProfileUser = users && users.length ? users[0] : undefined;
    return NextResponse.json({ user, success: true });
  } catch (err) {
    return NextResponse.json({ message: "Fetch user error!", success: false });
  }
}

export { GET };
