import { defineDriver, read } from "@utils/neo4j/neo4j";
import {  CommunityDiscussionInfoForMessageRoom } from "models/community";
import { NextRequest, NextResponse } from "next/server";

async function GET_COMMUNITY_DISCUSSION_INFO(
  request: NextRequest,
  { params }: { params: { community_id: string, community_discussion_id: string } }
) {
  const { community_id, community_discussion_id } = params;
  const communityDiscussionId = community_discussion_id as string;
  const communityId = community_id as string;

  let communityDiscussionInfo: CommunityDiscussionInfoForMessageRoom | undefined; 
  
if (!communityId) {
    return new NextResponse("Community Discussion must have an community id", { status: 400 });
  }

  if (!communityDiscussionId) {
    return new NextResponse("Community Discussion must have an id", { status: 400 });
  }

  const driver = defineDriver();
  const session = driver.session();

  try {
    const result = await read(
        session,
        `
          MATCH (cmtyDisc:CommunityDiscussion {id: $communityDiscussionId})-[:POSTED_DISCUSSION_ON]->(cmty:Community)
          OPTIONAL MATCH (cmtyDisc)-[:INVITED_TO_DISCUSSION]->(iUsers: User)
          OPTIONAL MATCH (cmtyDisc)-[:JOINED_DISCUSSION]->(jUsers: User)
          WITH cmtyDisc as communityDiscussion,
                cmty as community,
                collect(DISTINCT iUsers) as invitedUsers,
                collect(DISTINCT jUsers) as joinedUsers
          RETURN communityDiscussion, community, invitedUsers, joinedUsers
        `,
        {
          communityDiscussionId
        },
        ["communityDiscussion", 'community', 'invitedUsers', 'joinedUsers']
    );
    
    communityDiscussionInfo = result && result.length ? result[0] : undefined;

  } catch (err) {
    return NextResponse.json({ message: "Fetch community discussion info error!", success: false });
  }
  finally {
    await session.close();
  }

  return NextResponse.json(communityDiscussionInfo ?? {});
}




export {
  GET_COMMUNITY_DISCUSSION_INFO as GET,
};