// app/api/tweets/[tweet_id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { defineDriver, read, write } from "@utils/neo4j/neo4j";
import { PostToDisplay } from "typings";

async function PATCH(
  request: NextRequest,
  { params }: { params: { tweet_id: string } }
) {
  const body = await request.json();
  const { tweet_id } = params;
  const tweetId = tweet_id as string;

  if (!tweetId) {
    return new NextResponse("Post ID is required", { status: 400 });
  }

  const driver = defineDriver();
  const session = driver.session();

  try {
    if (!body["bookmarked"]) {
      await write(
        session,
        `
            // Match the user node
            MERGE (u:User {id: $userId})
            // Match the tweet node
            MERGE (t:Post {id: $tweetId})
            // Create the 'BOOKMARKED' relationship with a timestamp
            MERGE (u)-[r:BOOKMARKED]->(t)
            ON CREATE SET r.timestamp = timestamp()
        `,
        { userId: body["userId"], tweetId: tweet_id }
      );
    } else if (body["bookmarked"]) {
      await write(
        session,
        `
        MATCH (u:User {id: $userId})-[r:BOOKMARKED]->(t:Post {id: $tweetId})
        DELETE r
        `,
        { userId: body["userId"], tweetId: tweet_id }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "Patch Post error!", success: false });

  }
}

export {  PATCH };
