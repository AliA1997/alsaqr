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
    return new NextResponse("User ID is required for following someone", { status: 400 });
  }

  const driver = defineDriver();
  const session = driver.session();

  try {
    await write(
      session,
      `
        // Match the user node
        MERGE (user:User {id: $userId})
        // Match the user to follow node
        MERGE (userToFollow:User {id: $userToFollowId})
        // Create the 'FOLLOW_USER' relationship with a timestamp
        MERGE (user)-[followUserRel:FOLLOW_USER]->(userToFollow)
        // Create the 'FOLLOWED' relationship with a timestamp
        MERGE (userToFollow)-[followedRel:FOLLOWED]->(user)

        ON CREATE SET followUserRel.timestamp = timestamp()
        ON CREATE SET followedRel.timestamp = timestamp()
      `,
      { userToFollowId: body["userToFollowId"], userId }
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "Patch Follow User error!", success: false });

  }
}

export {  PATCH };
