import { NextRequest, NextResponse } from "next/server";
import { defineDriver, write } from "@utils/neo4j/neo4j";
import { FollowUserFormDto } from "models/users";

async function PATCH_FOLLOW_USER(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const { values:data }: { values: FollowUserFormDto }= await request.json();
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
      { userToFollowId: data.userToFollowId, userId }
    );

    await write(
      session,
      `
        // Match following user
        MATCH (followingUser:User {id: $userId})
        // Match the followed user (fixed relationship direction)
        MATCH (followedUser:User {id: $userToFollowId})
        // Create notification connected to author
        CREATE (followedUser)-[:NOTIFIED_BY]->(n:Notification {
          id: "notification_" + randomUUID(),
          message: followingUser.username " is following you",
          read: false,
          relatedEntityId: followingUser.id,
          link: "/users/" + followingUser.id,
          createdAt: datetime(),
          updatedAt: null,
          _rev: null,
          _type: "notification",
          notificationType: "follow_user"
        })
        `,
      { userId,userToFollowId: data.userToFollowId }
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "Patch Follow User error!", success: false });

  }
}

export { PATCH_FOLLOW_USER as PATCH };
