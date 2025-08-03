import { defineDriver, write } from '@utils/neo4j/neo4j';
import { CommunityInviteConfirmationDto } from 'models/community';
import { NextResponse } from 'next/server';

async function PUT_TO_JOIN_COMMUNITY_DISCUSSION(
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
        // Connect to graph db(neo4j)
        const driver = defineDriver();
        const session = driver.session();
        await write(
            session,
            `
            // Match the user node
            MERGE (invitedUser:User {id: $userId})
            // Match the community discussion node
            MERGE (communityDiscussion: CommunityDiscussion {id: $communityDiscussionId})
            // Create the 'JOINED' relationship with a timestamp
            MERGE (invitedUser)-[r:JOINED_TO_DISCUSSION]->(community)
            ON CREATE SET r.timestamp = timestamp()
        `,
            { userId: user_id as string, communityDiscussionId: community_discussion_id as string }
        );
        // Created notification

        await write(
            session,
            `
            // Match joined user
            MATCH (invitedUser:User {id: $userId})
            MATCH (communityDiscussion: CommunityDiscussion {id: $communityDiscussionId})
            MATCH (community:Community { id: communityDiscussion.communityId })
            // Match the community discussion creator
            MATCH (communityDiscussionCreator:User)-[:CREATED_DISCUSSION]->(communityDiscussion)
            // Create notification connected to admin
            CREATE (communityDiscussionCreator)-[:NOTIFIED_BY]->(n:Notification {
                id: "notification_" + randomUUID(),
                message: invitedUser.username + " joined your discussion of  " + communityDiscussion.name + " in the community of " + community.name + ".",
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
            { userId: user_id as string, communityDiscussionId: community_discussion_id as string }
        );


        // Return success response
        return NextResponse.json(
            {
                success: true,
                message: 'Joined Community Discussion Successfully',
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
    PUT_TO_JOIN_COMMUNITY_DISCUSSION as PUT
}