// app/api/tweets/[tweet_id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { defineDriver, read, write } from "@utils/neo4j/neo4j";


async function PATCH(
    request: NextRequest,
    { params }: { params: { user_id: string } }
  ) {
    const body = await request.json();
    const { user_id } = params;
    const userId = user_id as string;
  
    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }
  
    const driver = defineDriver();
    const session = driver.session();

    try {
      if (!body["saved"]) {
        await write(
          session,
          `
          // Match the user node
          MERGE (u:User {id: $userId})
          // Match the tweet node
          MERGE (l:List {id: $listId})
          // Create the 'LIKES' relationship with a timestamp
          MERGE (u)-[ur:SAVES]->(l)
          MERGE (l)-[lr:SAVED]->(u)
          ON CREATE SET ur.timestamp = timestamp()
          ON CREATE SET lr.timestamp = timestamp()
          `,
          { userId: userId, listId: body["listId"] }
        );
      } else if (body["saved"]) {
        await write(
          session,
          `
          // Match the user, list, and the 'SAVES' relationship
          MATCH (u:User {id: $userId})-[r:SAVES]->(l:List {id: $listId})
          // Delete the 'SAVES' relationship
          DELETE r
          MATCH (l:List {id: $listId})-[lr:SAVED]->(u:User {id: $userId})
          // Delete the 'SAVED' relationship
          DELETE lr
          `,
          { userId: userId, listId: body["listId"] }
        );
      }
  
      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json({ message: "Patch Post error!", success: false });
  
    }
  }

export {  PATCH };
