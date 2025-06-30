// app/api/tweets/[tweet_id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { defineDriver, read } from "@utils/neo4j/neo4j";
import { ProfileUser } from "typings";

async function GET_USER_PROFILE_INFO(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const { username } = params;

  if (!username) {
    return new NextResponse("Username is required", { status: 400 });
  }

  const driver = defineDriver();
  const session = driver.session();

  try {
    // Adjust the Cypher query to fetch the tweet by ID

    const users = await read(
      session,
      `
        MATCH (user:User {username: $username})
        OPTIONAL MATCH (user)-[:BOOKMARKED]->(bookmark:Post)
        RETURN user,
              COLLECT(DISTINCT bookmark.id) AS bookmarks
      `,
      { username },
      ["user", 'bookmarks']
    );
    const user: ProfileUser = users && users.length ? users[0] : undefined;
    return NextResponse.json({ user, success: true });
  } catch (err) {
    return NextResponse.json({ message: "Fetch user error!", success: false });
  }
}

export { GET_USER_PROFILE_INFO as GET };
