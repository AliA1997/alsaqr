// app/api/invites/confirm/route.ts
import { INVITATION_EXPIRE_TIME } from '@utils/constants';
import { connectToDatabase } from '@utils/mongo';
import { defineDriver, write } from '@utils/neo4j/neo4j';
import { AcceptOrDenyCommunityInviteConfirmationDto, CommunityInviteConfirmation, CommunityInviteConfirmationDto } from 'models/community';
import { NextResponse } from 'next/server';

async function POST_REQUEST_TO_JOIN_COMMUNITY(
  request: Request,
  { params }: { params: { user_id: string, community_id: string } }
) {
  try {
    const { user_id, community_id } = params;
    const { values }: { values: CommunityInviteConfirmationDto } = await request.json();

    if (!user_id || !community_id || !values.email || !values.username) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const communityInvitesCollection = db.collection('community-invites');

    // Connect to graph db(neo4j)
    const driver = defineDriver();
    const session = driver.session();

    // Create the confirmation record
    const confirmation: Omit<CommunityInviteConfirmation, '_id'> = {
      userId: user_id as string,
      communityId: community_id as string,
      username: values.username,
      email: values.email,
      confirmedAt: new Date(),
      expiresAt: new Date(Date.now() + INVITATION_EXPIRE_TIME), // 72 hours from now
    };

    const communityInvitationResult = await communityInvitesCollection.insertOne(confirmation);

    await write(
      session,
      `
          // Match the user node
          MERGE (invitedUser:User {id: $userId})
          // Match the community node
          MERGE (community:Community {id: $communityId})
          // Create the 'INVITE_REQUESTED' relationship with a timestamp
          MERGE (community)-[r:INVITE_REQUESTED]->(invitedUser)
          ON CREATE SET r.timestamp = timestamp()
        `,
      { userId: user_id as string, communityId: community_id as string }
    );

    // Create notification for invite confirmation
    await write(
      session,
      `
          // Match invited user
          MATCH (invitedUser:User {id: $userId})
          MATCH (community: Community {id: $communityId})
          // Match the community admin
          MATCH (communityAdmin:User)-[:CREATED_COMMUNITY]->(community)
          // Create notification connected to admin
          CREATE (communityAdmin)-[:NOTIFIED_BY]->(n:Notification {
              id: "notification_" + randomUUID(),
              message: invitedUser.username + " has requested to join your community of  " + community.name + ".",
              read: false,
              relatedEntityId: community.id,
              link: "/communities/" + community.id,
              createdAt: datetime(),
              updatedAt: null,
              _rev: null,
              _type: "notification",
              notificationType: "user_request_join"
          })
      `,
      { userId: user_id as string, communityId: community_id as string }
    );
    // Return success response
    return NextResponse.json(
      {
        success: true,
        confirmationId: communityInvitationResult.insertedId,
        message: 'Invite confirmation recorded successfully',
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


async function PUT_ACCEPT_OR_DENY_REQUEST_TO_JOIN_COMMUNITY(
  request: Request,
  { params }: { params: { user_id: string, community_id: string } }
) {
  try {
    const { values }: { values: AcceptOrDenyCommunityInviteConfirmationDto } = await request.json();

    const { user_id, community_id } = params;

    if (!user_id || !community_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const communityInvitesCollection = db.collection('community-invites');

    // Connect to graph db(neo4j)
    const driver = defineDriver();
    const session = driver.session();

    const communityInvitationResult = await communityInvitesCollection.findOne({
      communityId: community_id as string,
      userId: user_id as string
    });

    if (!communityInvitationResult)
      return NextResponse.json(
        { error: 'Community Invite Confirmation Not Found' },
        { status: 404 }
      );

    // if (communityInvitationResult.denied)
    //   return NextResponse.json(
    //     { error: 'Community Invite has been denied for this user.' },
    //     { status: 401 }
    //   );

    // if (communityInvitationResult.accepted)
    //   return NextResponse.json(
    //     { error: 'Community Invite has already been accepted for this user.' },
    //     { status: 401 }
    //   );

    if (values.accept) {
      await write(
        session,
        `
              // Match the user node
              MERGE (invitedUser:User {id: $userId})
              // Match the community node
              MERGE (community:Community {id: $communityId})
              // Create the 'INVITED' relationship with a timestamp
              MERGE (community)-[r:INVITED]->(invitedUser)
              ON CREATE SET r.timestamp = timestamp()
            `,
        { userId: user_id as string, communityId: community_id as string }
      );

      // Create notification for accepted invite
      await write(
        session,
        `
            // Match invited user
            MATCH (invitedUser:User {id: $userId})
            MATCH (community: Community {id: $communityId})
            // Match the community admin
            MATCH (communityAdmin:User)-[:CREATED_COMMUNITY]->(community)
            // Create notification connected to admin
            CREATE (communityAdmin)-[:NOTIFIED_BY]->(n:Notification {
                id: "notification_" + randomUUID(),
                message: invitedUser.username + " joined your community of  " + community.name + ".",
                read: false,
                relatedEntityId: community.id,
                link: "/communities/" + community.id,
                createdAt: datetime(),
                updatedAt: null,
                _rev: null,
                _type: "notification",
                notificationType: "user_joined"
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
            MATCH (community: Community {id: $communityId})
            // Match the community admin
            MATCH (communityAdmin:User)-[:CREATED_COMMUNITY]->(community)
            // Create notification connected to admin
            CREATE (communityAdmin)-[:NOTIFIED_BY]->(n:Notification {
                id: "notification_" + randomUUID(),
                message: invitedUser.username + " denied from  your community of  " + community.name + ".",
                read: false,
                relatedEntityId: community.id,
                link: "/communities/" + community.id,
                createdAt: datetime(),
                updatedAt: null,
                _rev: null,
                _type: "notification",
                notificationType: "user_joined"
            })
        `,
        { userId: user_id as string, communityId: community_id as string }
      );

    }

    // Delete REQUEST_INVITE record in neo4j
    await write(
      session,
      `
          MATCH (community:Community {id: $communityId})-[r:INVITE_REQUESTED]->(invitedUser:User {id: $userId})
          DELETE r
          `,
      { userId: user_id as string, communityId: community_id as string }
    );

    // Delete request notification
    await write(
      session,
      `
              // Match the joined User 
              MATCH (invitedUser:User {id: $userId})
              MATCH (community:Community {id: $communityId})
              // Match the author who created the community
              MATCH (communityAdmin:User)-[:CREATED_COMMUNITY]->(community)
              // Find and delete the specific notification
              MATCH (communityAdmin)-[r:NOTIFIED_BY]->(n:Notification {
                relatedEntityId: community.id,
                notificationType: "user_request_join"
              })
              DELETE r, n
              `,
      { userId: user_id as string, communityId: community_id as string }
    );

    console.log('communityInvitationResult', communityInvitationResult);
    await communityInvitesCollection.deleteOne(communityInvitationResult)

    // Return success response
    return NextResponse.json(
      {
        success: true,
        confirmationId: communityInvitationResult._id,
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
  POST_REQUEST_TO_JOIN_COMMUNITY as POST,
  PUT_ACCEPT_OR_DENY_REQUEST_TO_JOIN_COMMUNITY as PUT
}