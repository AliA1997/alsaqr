import { defineDriver, getUserIdFromSession, read, write } from "@utils/neo4j/neo4j";
import type { UpdateCommunityFormDto } from "models/community";
import { NextRequest, NextResponse } from "next/server";
import type { CommunityAdminInfo } from "typings";


async function GET_COMMUNITY_INFO(
  request: NextRequest,
  { params }: { params: { user_id: string, community_id: string } }
) {
  const { community_id, user_id } = params;
  const userId = user_id as string;
  const communityId = community_id as string;

  let adminCommunityInfo: CommunityAdminInfo | undefined;

  if (!userId) {
    return new NextResponse("User must be logged in", { status: 400 });
  }

  const driver = defineDriver();
  const session = driver.session();

  try {
    let query = `
      MATCH (community:Community {id: $communityId})

      // Get founder information and check if the specified user is the founder
      OPTIONAL MATCH (community)-[:COMMUNITY_FOUNDER]->(founder:User)
      WITH community, founder,
     EXISTS((community)-[:COMMUNITY_FOUNDER]->(:User {id: $userId})) AS isFounder

     // Get the invite requested users
     OPTIONAL MATCH (community)-[:INVITE_REQUESTED]->(inviteRequestedByUser:User)
      WITH community, founder, isFounder as isFounder, 
          COLLECT(DISTINCT inviteRequestedByUser) AS inviteRequestedUsers

      // Count invited users
      OPTIONAL MATCH (community)-[:INVITED]->(invitedUser:User)
      WITH community, founder, isFounder as isFounder, inviteRequestedUsers,
          COUNT(DISTINCT invitedUser) AS invitedCount

      // Count joined users
      OPTIONAL MATCH (joinedUser:User)-[:JOINED]->(community)
      WITH community, founder, isFounder as isFounder, inviteRequestedUsers, invitedCount,
          COUNT(DISTINCT joinedUser) AS joinedCount

      RETURN community,
        isFounder,
        founder,
        inviteRequestedUsers,
        invitedCount,
        joinedCount
    `;
    let results = await read(
      session,
      query,
      {
        userId,
        communityId
      },
      ["community", "isFounder", "founder", "inviteRequestedUsers", "invitedCount", "joinedCount"]
    );

    adminCommunityInfo = results && results.length ? results[0] : undefined;
    console.log('adminCommunityInfo:', adminCommunityInfo)

  } catch (err) {
    return NextResponse.json({ message: "Fetch communities error!", success: false });
  }
  finally {
    await session.close();
  }

  return NextResponse.json(adminCommunityInfo ?? {});
}


async function PUT_UPDATE_COMMUNITY(
  request: NextRequest,
  { params }: { params: { user_id: string, community_id: string } }
) {
  const { values: data }: { values: UpdateCommunityFormDto } = await request.json();
  const { community_id, user_id } = params;
  const userId = user_id as string;
  const communityId = community_id as string;

  if (!userId) {
    return new NextResponse("User ID is required for updating your user.", { status: 400 });
  }

  const driver = defineDriver();
  const session = driver.session();

  try {
    const userAuthSessionId = await getUserIdFromSession(session);
    console.log('userId != userAuthSessionId', userId != userAuthSessionId)
    if (userId != userAuthSessionId) {
      return new NextResponse("Only logged in user can update communities", { status: 400 });
    }
    console.log(`     {
        communityId,
        userId,
        ...data
      }`,      {
        communityId,
        userId,
        ...data
      })
    await write(
      session,
      `
              MATCH (cmty:Community { id: $communityId })
              MATCH (u:User {id: $userId })
              WHERE EXISTS((cmty)-[:COMMUNITY_FOUNDER]->(u))
              SET cmty.name = $name,
                  cmty.avatar = $avatar,
                  cmty.tags = $tags,
                  cmty.isPrivate = $isPrivate,
                  cmty.updatedAt = timestamp()
            `,
      {
        communityId,
        userId,
        ...data
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.log("error:", err);
    return NextResponse.json({ message: "Update User error!", success: false });

  }
}



export {
  GET_COMMUNITY_INFO as GET,
  PUT_UPDATE_COMMUNITY as PUT
}