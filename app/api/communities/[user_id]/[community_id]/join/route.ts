import { defineDriver, write } from '@utils/neo4j/neo4j';
import { CommunityInviteConfirmationDto } from 'models/community';
import { NextResponse } from 'next/server';

async function PUT_TO_JOIN_COMMUNITY(
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
        // Connect to graph db(neo4j)
        const driver = defineDriver();
        const session = driver.session();
        await write(
            session,
            `
            // Match the user node
            MERGE (invitedUser:User {id: $userId})
            // Match the community node
            MERGE (community:Community {id: $communityId})
            // Create the 'JOINED' relationship with a timestamp
            MERGE (invitedUser)-[r:JOINED]->(community)
            ON CREATE SET r.timestamp = timestamp()
        `,
            { userId: user_id as string, communityId: community_id as string }
        );
        // Created notification

        await write(
            session,
            `
            // Match joined user
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


        // Return success response
        return NextResponse.json(
            {
                success: true,
                message: 'Joined Successfully',
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
    PUT_TO_JOIN_COMMUNITY as PUT
}