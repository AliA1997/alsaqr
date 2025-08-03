// app/api/invites/confirm/route.ts
import { INVITATION_EXPIRE_TIME } from '@utils/constants';
import { connectToDatabase } from '@utils/mongo';
import { defineDriver, write } from '@utils/neo4j/neo4j';
import { AcceptOrDenyCommunityInviteConfirmationDto, CommunityDiscussionInviteConfirmation, CommunityInviteConfirmation, CommunityInviteConfirmationDto } from 'models/community';
import { NextResponse } from 'next/server';

async function POST_REQUEST_TO_JOIN_COMMUNITY_DISCUSSION(
  request: Request,
    { params }: { params: { user_id: string, community_id: string, community_discussion_id: string } }
) {
  try {
    const { user_id, community_id, community_discussion_id } = params;
    const { values }: { values: CommunityInviteConfirmationDto } = await request.json();

    if (!user_id || !community_id || !values.email || !values.username) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const communityDiscussionInvitesCollection = db.collection('community-discussion-invites');

    // Connect to graph db(neo4j)
    const driver = defineDriver();
    const session = driver.session();

    // Create the confirmation record
    const confirmation: Omit<CommunityDiscussionInviteConfirmation, '_id'> = {
      userId: user_id as string,
      communityId: community_id as string,
      communityDiscussionId: community_discussion_id as string,
      username: values.username,
      email: values.email,
      confirmedAt: new Date(),
      expiresAt: new Date(Date.now() + INVITATION_EXPIRE_TIME), // 72 hours from now
    };

    const communityDiscussionInvitationResult = await communityDiscussionInvitesCollection.insertOne(confirmation);

    await write(
      session,
      `
          // Match the user node
          MERGE (invitedUser:User {id: $userId})
          // Match the community node
          MERGE (communityDiscussion:CommunityDiscussion {id: $communityDiscussionId})
          // Create the 'INVITE_REQUESTED' relationship with a timestamp
          MERGE (communityDiscussion)-[r:INVITE_REQUESTED_FOR_DISCUSSION]->(invitedUser)
          ON CREATE SET r.timestamp = timestamp()
        `,
      { userId: user_id as string, communityDiscussionId: community_discussion_id as string }
    );

    // Create notification for invite confirmation
    await write(
      session,
      `
          // Match invited user
          MATCH (invitedUser:User {id: $userId})
          MATCH (communityDiscussion:CommunityDiscussion {id: $communityDiscussionId})
          MATCH (community:Community {id: communityDiscussion.communityId})
          // Match the community discussion creator
          MATCH (communityDiscussionCreator:User)-[:CREATED_DISCUSSION]->(communityDiscussion)
          // Create notification connected to admin
          CREATE (communityDiscussionCreator)-[:NOTIFIED_BY]->(n:Notification {
              id: "notification_" + randomUUID(),
              message: invitedUser.username + " has requested to join your discussion of  " + communityDiscussion.name + " in the community of " + community.name,
              read: false,
              relatedEntityId: communityDiscussion.id,
              link: "/communities/" + community.id + "/" + communityDiscussion.id,
              createdAt: datetime(),
              updatedAt: null,
              _rev: null,
              _type: "notification",
              notificationType: "user_request_join_discussion"
          })
      `,
      { userId: user_id as string, communityId: community_id as string }
    );
    // Return success response
    return NextResponse.json(
      {
        success: true,
        confirmationId: communityDiscussionInvitationResult.insertedId,
        message: 'Invite discussion confirmation recorded successfully',
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


async function PUT_ACCEPT_OR_DENY_REQUEST_TO_JOIN_COMMUNITY_DISCUSSION(
  request: Request,
  { params }: { params: { user_id: string, community_id: string, community_discussion_id: string } }
) {
  try {
    const { values }: { values: AcceptOrDenyCommunityInviteConfirmationDto } = await request.json();

    const { user_id, community_id, community_discussion_id } = params;

    if (!user_id || !community_id || !community_discussion_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const communityDiscussionInvitesCollection = db.collection('community-discussion-invites');

    // Connect to graph db(neo4j)
    const driver = defineDriver();
    const session = driver.session();

    const communityDiscussionInvitationResult = await communityDiscussionInvitesCollection.findOne({
      communityId: community_id as string,
      communityDiscussionId: community_discussion_id as string,
      userId: user_id as string
    });

    if (!communityDiscussionInvitationResult)
      return NextResponse.json(
        { error: 'Community Invite Confirmation Not Found' },
        { status: 404 }
      );

    if (communityDiscussionInvitationResult.denied)
      return NextResponse.json(
        { error: 'Community Invite has been denied for this user.' },
        { status: 401 }
      );

    if (communityDiscussionInvitationResult.accepted)
      return NextResponse.json(
        { error: 'Community Invite has already been accepted for this user.' },
        { status: 401 }
      );

    if (values.accept) {
      await write(
        session,
        `
              // Match the user node
              MERGE (invitedUser:User {id: $userId})
              // Match the community node
              MERGE (communityDiscussion: CommunityDiscussion {id: $communityDiscussionId})
              // Create the 'INVITED_TO_DISCUSSION' relationship with a timestamp
              MERGE (communityDiscussion)-[r:INVITED_TO_DISCUSSION]->(invitedUser)
              ON CREATE SET r.timestamp = timestamp()
            `,
        { userId: user_id as string, communityDiscussionId: community_discussion_id as string }
      );

      // Create notification for accepted invite
      await write(
        session,
        `
            // Match invited user
            MATCH (invitedUser:User {id: $userId})
            MATCH (communityDiscussion: CommunityDiscussion {id: $communityDiscussionId})
            MATCH (community:Community { id: communityDiscussion.communityId })
            // Match the community discussion creator
            MATCH (communityDiscussionCreator:User)-[:CREATED_DISCUSSION]->(communityDiscussion)
            // Create notification connected to admin
            CREATE (communityDiscussionCreator)-[:NOTIFIED_BY]->(n:Notification {
                id: "notification_" + randomUUID(),
                message: invitedUser.username + " joined a community discussion of  " + communityDiscussion.name +  " found in the community of " + community.name + ".",
                read: false,
                relatedEntityId: communityDiscussion.id,
                link: "/communities/" + community.id + "/" + communityDiscussion.id,
                createdAt: datetime(),
                updatedAt: null,
                _rev: null,
                _type: "notification",
                notificationType: "user_joined_discussion"
            })
        `,
        { userId: user_id as string, communityId: community_id as string }
      );
    } else {
      // Create notification for denied invite
      await write(
        session,
        `
            // Match invited user
            MATCH (invitedUser:User {id: $userId})
            MATCH (communityDiscussion: CommunityDiscussion {id: $communityDiscussionId})
            MATCH (community:Community { id: communityDiscussion.communityId })
            // Match the community discussion creator
            MATCH (communityDiscussionCreator:User)-[:CREATED_DISCUSSION]->(communityDiscussion)
            // Create notification connected to admin
            CREATE (communityDiscussionCreator)-[:NOTIFIED_BY]->(n:Notification {
                id: "notification_" + randomUUID(),
                message: invitedUser.username + " denied from  your community disucssion of  " + community.name + " in the commmunity of  " + communityDiscussion.name + ".",
                read: false,
                relatedEntityId: communityDiscussion.id,
                link: "/communities/" + community.id + "/" + communityDiscussion.id,
                createdAt: datetime(),
                updatedAt: null,
                _rev: null,
                _type: "notification",
                notificationType: "user_joined_discussion"
            })
        `,
        { userId: user_id as string, communityId: community_id as string, communityDiscussionId: community_discussion_id as string }
      );

    }

    // Delete REQUEST_INVITE_TO_DISCUSSION record in neo4j
    await write(
      session,
      `
          MATCH (communityDiscussion: CommunityDiscussion {id: $communityDiscussionId})-[r:REQUEST_INVITE_TO_DISCUSSION]->(invitedUser:User {id: $userId})
          DELETE r
          `,
      { userId: user_id as string, communityDiscussionId: community_discussion_id as string }
    );

    // Delete request notification
    await write(
      session,
      `
              // Match the joined User 
              MATCH (invitedUser:User {id: $userId})
              MATCH (communityDiscussion: CommunityDiscussion {id: $communityDiscussionId})
              // Match the author who created the community discussion
              MATCH (communityDiscussionCreator:User)-[:CREATED_DISCUSSION]->(communityDiscussion)
              // Find and delete the specific notification
              MATCH (communityDiscussionCreator)-[r:NOTIFIED_BY]->(n:Notification {
                relatedEntityId: communityDiscussion.id,
                notificationType: "user_request_join_discussion"
              })
              DELETE r, n
              `,
      { userId: user_id as string, communityDiscussionId: community_discussion_id as string }
    );

    console.log('communityDiscussionInvitationResult', communityDiscussionInvitationResult);
    await communityDiscussionInvitesCollection.deleteOne(communityDiscussionInvitationResult)

    // Return success response
    return NextResponse.json(
      {
        success: true,
        confirmationId: communityDiscussionInvitationResult._id,
        message: values.accept ? 'Confirmation accepted successfully' : 'Confirmation denied successfully',
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

// export const dynamic = 'force-dynamic';

export {
  POST_REQUEST_TO_JOIN_COMMUNITY_DISCUSSION as POST,
  PUT_ACCEPT_OR_DENY_REQUEST_TO_JOIN_COMMUNITY_DISCUSSION as PUT
}