import { defineDriver, write } from '@utils/neo4j/neo4j';
import { NextResponse } from 'next/server';

async function PUT_REQUEST_TO_UNJOIN_COMMUNITY_DISCUSSION(
    request: Request,
    { params }: { params: { user_id: string, community_id: string, community_discussion_id: string } }
) {
  try {
    const { user_id, community_discussion_id } = params;
    // Connect to graph db(neo4j)
    const driver = defineDriver();
    const session = driver.session();

    // Delete the invited or joined user.
    // Delete invite relationship
    await write(
        session,
        `
          MATCH (communityDiscussion: CommunityDiscussion { id: $communityDiscussionId })-[ir:INVITED_TO_DISCUSSION]->(u:User { id: $userId })
          DELETE ir;
        `,
        { userId: user_id as string, communityDiscussionId: community_discussion_id as string }
    );
    // Delete Joined Relationship
    await write(
        session,
        `
          MATCH (communityDiscussion: CommunityDiscussion { id: $communityDiscussionId })-[jr:JOINED_TO_DISCUSSION]->(u:User { id: $userId })
          DELETE jr;
        `,
        { userId: user_id as string, communityDiscussionId: community_discussion_id as string }
    );
    
    // Delete notification
    await write(
        session,
        `
          // Match the joined User 
          MATCH (joinedOrInvitedUser:User {id: $userId})
          MATCH (communityDiscussion: CommunityDiscussion {id: $communityDiscussionId})
          // Match the author who started community discussion
          MATCH (communityDiscussionCreator:User)-[:CREATED_DISCUSSION]->(communityDiscussion)
          // Find and delete the specific notification
          MATCH (communityDiscussionCreator)-[r:NOTIFIED_BY]->(n:Notification {
            relatedEntityId: communityDiscussion.id,
            notificationType: "user_joined_discussion"
          })
          DELETE r, n
          `,
        { userId: user_id as string, communityDiscussionId: community_discussion_id as string }
    );

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Left Discussion Successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error joining discussion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export { 
    PUT_REQUEST_TO_UNJOIN_COMMUNITY_DISCUSSION as PUT
}