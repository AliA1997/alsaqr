// app/api/tweets/[tweet_id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { defineDriver, write } from "@utils/neo4j/neo4j";
import { UnFollowUserFormDto } from "models/users";

async function PATCH_UNFOLLOW_USER(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const { values:data }: { values: UnFollowUserFormDto }= await request.json();
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
        MATCH (user:User {id: $userId})-[followUserRel:FOLLOW_USER]->(userToUnFollow:User {id: $userToUnFollowId})
        DELETE followUserRel
      `,
      { userToUnFollowId: data.userToUnFollowId, userId }
    );


    await write(
      session,
      `
        MATCH (userToUnFollow:User {id: $userToUnFollowId})-[followedRel:FOLLOWED]->(user:User {id: $userId})
        DELETE followedRel
      `,
      { userToUnFollowId: data.userToUnFollowId, userId }
    );


    await write(
        session,
        `
        // Match following user
        MATCH (followingUser:User {id: $userId})
        // Match the followed user (fixed relationship direction)
        MATCH (followedUser:User {id: $userToFollowId})
        MATCH (followedUser)-[r:NOTIFIED_BY]->(n:Notification {
          relatedEntityId: followingUser.id,
          notificationType: "follow_user"
        })
        DELETE r, n
        `,
      { userToUnFollowId: data.userToUnFollowId, userId }
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "Patch UnFollow User error!", success: false });

  }
}

export { PATCH_UNFOLLOW_USER as PATCH };
