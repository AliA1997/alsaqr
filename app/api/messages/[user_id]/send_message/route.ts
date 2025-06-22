import { faker } from "@faker-js/faker";
import { defineDriver, write } from "@utils/neo4j/neo4j";
import { NextRequest, NextResponse } from "next/server";


async function POST(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const body = await request.json();
  const driver = defineDriver();
  const session = driver.session();
  const { user_id } = params;
  const senderId = user_id as string;
  const text = body["text"] ?? "";
  const image = body["image"] ?? "";
  const senderUsername = body["senderUsername"] ?? "";
  const senderProfileImg = body["senderProfileImg"] ?? "";
  const recipientId = body["recipientId"] ?? "";
  const recipientProfileImg = body["recipientProfileImg"] ?? "";
  const recipientUsername = body["recipientUsername"] ?? "";

  if (!recipientId) {
    return new NextResponse("Receiver is required", { status: 400 });
  }

  if (!text) {
    return new NextResponse("Text of the message is required", { status: 400 });
  }

  try {
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
            recipientId: $recipientId,
            text: $text,
            image: $image,
            senderUsername: $senderUsername,
            senderProfileImg: $senderProfileImg,
            recipientUsername: $recipientUsername,
            recipientProfileImg: $recipientProfileImg
        })
        CREATE (receiver)-[:RECEIVED_MESSAGE]->(m)
        CREATE (m)-[:SENDER]->(sender)
        CREATE (m)-[:RECIPIENT]->(receiver)
        `,
      { 
        id: faker.datatype.uuid(), 
        _receiveMessageId: faker.datatype.uuid(), 
        senderId, 
        recipientId, 
        text, 
        image, 
        senderUsername, 
        senderProfileImg,
        recipientUsername,
        recipientProfileImg
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "Add community error!", success: false });
  } finally {
    await session.close();
  }
}

export { POST };