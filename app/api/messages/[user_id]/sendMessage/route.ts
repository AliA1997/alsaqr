import { faker } from "@faker-js/faker";
import { defineDriver, write } from "@utils/neo4j/neo4j";
import { NextRequest, NextResponse } from "next/server";
import { MessageFormDto } from "typings";


async function POST_SEND_MESSAGE(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const { values:data }: { values: MessageFormDto } = await request.json();
  const driver = defineDriver();
  const session = driver.session();
  const { user_id } = params;
  const userId = user_id as string;

  console.log('post direct message data:', data);

  if(userId !== data.senderId)
    return new NextResponse("Logged In user can only send direct messages", { status: 400 });

  if (!data.recipientId) {
    return new NextResponse("Receiver is required", { status: 400 });
  }

  if (!data.text) {
    return new NextResponse("Text of the message is required", { status: 400 });
  }

  try {
    const messageId = `message_${faker.datatype.uuid()}`;

    await write(
      session,
      `
        // Create a new message records, reference recipient information.
        MERGE (sender:User {id: $senderId})
        MERGE (receiver:User {id: $recipientId})
        CREATE (sender)-[:SEND_MESSAGE]->(m:Message {
          id: $id,
          createdAt: datetime(),
          updatedAt: null,  
          senderId: $senderId,
          senderUsername: $senderUsername,
          senderProfileImg: $senderProfileImg,
          recipientId: $recipientId,
          recipientUsername: $recipientUsername,
          recipientProfileImg: $recipientProfileImg,
          text: $text,
          image: $image,
          messageType: $messageType
        })
        CREATE (receiver)-[:RECEIVED_MESSAGE]->(m)
        `,
      { 
        id: messageId, 
        ...data,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "Add direct message error!", success: false });
  } finally {
    await session.close();
  }
}

export { POST_SEND_MESSAGE as POST };