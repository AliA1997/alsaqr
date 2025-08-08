import { defineDriver, write } from '@utils/neo4j/neo4j';
import { NextResponse } from 'next/server';

async function PUT_REQUEST_TO_UNJOIN_COMMUNITY(
    request: Request,
    { params }: { params: { user_id: string, community_id: string } }
) {
  try {
    const { user_id, community_id } = params;
    // Connect to graph db(neo4j)
    const driver = defineDriver();
    const session = driver.session();

    // Delete the invited or joined user.
    // Delete invite relationship
    await write(
        session,
        `
          MATCH (community: Community { id: $communityId })-[ir:INVITED]->(u:User { id: $userId })
          DELETE ir;
        `,
        { userId: user_id as string, communityId: community_id as string }
    );
    // Delete Joined Relationship
    await write(
        session,
        `
          MATCH (u:User { id: $userId })-[jr:JOINED]->(community: Community { id: $communityId })
          DELETE jr;
        `,
        { userId: user_id as string, communityId: community_id as string }
    );
    
    // Delete notification
    await write(
        session,
        `
          // Match the joined User 
          MATCH (joinedOrInvitedUser:User {id: $userId})
          MATCH (community:Community {id: $communityId})
          // Match the author who created the community
          MATCH (communityAdmin:User)-[:CREATED_COMMUNITY]->(community)
          // Find and delete the specific notification
          MATCH (communityAdmin)-[r:NOTIFIED_BY]->(n:Notification {
            relatedEntityId: community.id,
            notificationType: "user_joined"
          })
          DELETE r, n
          `,
        { userId: user_id as string, communityId: community_id as string }
    );

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Left community Successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error confirming invite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export { 
    PUT_REQUEST_TO_UNJOIN_COMMUNITY as PUT
}