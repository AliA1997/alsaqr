import { defineDriver, read } from "@utils/neo4j/neo4j";
import {  CommunityDiscussionAdminInfo,  } from "models/community";
import { NextRequest, NextResponse } from "next/server";

async function GET_COMMUNITY_DISCUSSION_ADMIN_INFO(
  request: NextRequest,
  { params }: { params: { user_id: string, community_id: string, community_discussion_id: string } }
) {
  const { user_id, community_id, community_discussion_id } = params;
  const userId = user_id as string
  const communityDiscussionId = community_discussion_id as string;
  const communityId = community_id as string;
  let communityDiscussionAdminInfo: CommunityDiscussionAdminInfo | undefined; 
  
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
        MATCH (communityDiscussion:CommunityDiscussion {id: $communityDiscussionId})-[:POSTED_DISCUSSION_ON]->(cmty:Community)
        // Get community discussion creator information and check if the specified user is the founder
        OPTIONAL MATCH (founder:User)-[:CREATED_DISCUSSION]->(communityDiscussion)
        WITH communityDiscussion, founder,
        
        EXISTS((:User {id: $userId})-[:CREATED_DISCUSSION]->(communityDiscussion)) AS isFounder
        // Get the invite requested users
        OPTIONAL MATCH (communityDiscussion)-[:INVITE_REQUESTED_FOR_DISCUSSION]->(inviteRequestedByUser:User)
        WITH communityDiscussion, founder, isFounder as isFounder, 
          COLLECT(DISTINCT inviteRequestedByUser) AS inviteRequestedUsers

        // Count invited users
        OPTIONAL MATCH (communityDiscussion)-[:INVITED_TO_DISCUSSION]->(invitedUser:User)
        WITH communityDiscussion, founder, isFounder as isFounder, inviteRequestedUsers,
            COUNT(DISTINCT invitedUser) AS invitedCount
            
        // Count joined users
        OPTIONAL MATCH (communityDiscussion)-[:JOINED_TO_DISCUSSION]->(joinedUser:User)
        WITH communityDiscussion, founder, isFounder as isFounder, inviteRequestedUsers, invitedCount,
            COUNT(DISTINCT joinedUser) AS joinedCount


        RETURN communityDiscussion,
          isFounder,
          founder,
          inviteRequestedUsers,
          invitedCount,
          joinedCount
        `,
        {
          userId,
          communityDiscussionId
        },
        ["communityDiscussion", 'isFounder', 'founder', 'inviteRequestedUsers', 'invitedCount', 'joinedCount']
    );
    
    communityDiscussionAdminInfo = result && result.length ? result[0] : undefined;

  } catch (err) {
    return NextResponse.json({ message: "Fetch community discussion info error!", success: false });
  }
  finally {
    await session.close();
  }

  console.log('communityDiscussionAdminInfo:', communityDiscussionAdminInfo)
  return NextResponse.json(communityDiscussionAdminInfo ?? {});
}




export {
  GET_COMMUNITY_DISCUSSION_ADMIN_INFO as GET,
};