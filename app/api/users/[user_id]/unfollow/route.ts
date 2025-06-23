// app/api/tweets/[tweet_id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { defineDriver, write } from "@utils/neo4j/neo4j";

async function PATCH(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const body = await request.json();
  const { user_id } = params;
  const userId = user_id as string;

  if (!userId) {
    return new NextResponse("User ID is required for unfollowing someone", { status: 400 });
  }

  const driver = defineDriver();
  const session = driver.session();

  try {
    await write(
      session,
      `
        MATCH (user:User {id: $userId})-[followUserRel:FOLLOW_USER]->(userToFollow:User {id: $userToFollowId})
        DELETE followUserRel
        MATCH (userToFollow:User {id: $userToFollowId})-[followedRel:FOLLOWED]->(user:User {id: $userId})
        DELETE followedRel
      `,
      { userToFollowId: body["userToFollowId"], userId }
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "Patch UnFollow User error!", success: false });

  }
}

export {  PATCH };
