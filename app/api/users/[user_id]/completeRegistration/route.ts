import { defineDriver, write } from "@utils/neo4j/neo4j";
import { NextRequest, NextResponse } from "next/server";
import { UserRegisterFormDto } from "typings.d";

async function POST_COMPLETE_REGISTRATION(
    request: NextRequest,
    { params }: { params: { user_id: string } }
) {
  const { user_id } = params;
  const userId = user_id as string;
  const { values:data }: { values: UserRegisterFormDto } = await request.json();
  const driver = defineDriver();
  const session = driver.session();

  try {
    

    console.log("userID:", userId);
    console.log('data:', data);
    await write(
      session,
      `
      MATCH (u:User {id: $userId})
      SET u.username = $username,
          u.avatar = $avatar,
          u.bgThumbnail = $bgThumbnail,
          u.bio = $bio,
          u.firstName = $firstName,
          u.lastName = $lastName,
          u.dateOfBirth = $dateOfBirth,
          u.maritalStatus = $maritalStatus,
          u.hobbies = $hobbies,
          u.religion = $religion,
          u.countryOfOrigin = $countryOfOrigin,
          u.followingUsers = $followingUsers,
          u.updatedAt = timestamp(),
          u.isCompleted = true
      `,
      { ...data, userId }
    );

    await write(
      session,
      `
        MATCH (u:User {id: $userId})
        CREATE (u)-[:NOTIFIED_BY]->(n:Notification {
          id: "notification_" + randomUUID(),
          message: "You Completed your account registration.",
          read: false,
          relatedEntityId: u.id,
          link: "/users/" + u.username,
          createdAt: datetime(),
          updatedAt: null,
          _rev: null,
          _type: "notification",
          notificationType: "your_account"
        })
        `,
      { userId: userId }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.error();
  }
}

export { POST_COMPLETE_REGISTRATION as POST };