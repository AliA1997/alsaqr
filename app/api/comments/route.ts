// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextRequest, NextResponse } from "next/server";
import { Comment } from "../../../typings";
import { defineDriver, write } from "@utils/neo4j/neo4j";

type Data = {
  comments: Comment[];
};

function fetchDataUsingParams(param1: string | null, param2: string | null) {
  // Simulate fetching data based on query parameters
  return {
    message: `Data fetched with params: param1=${param1}, param2=${param2}`,
  };
}

export async function GET(req: NextRequest, res: NextResponse<Data>) {
  const { searchParams } = new URL(req.url);
  // Access individual query parameters
  const tweetId = searchParams.get("tweetId");

  // const comments: Comment[] = await sanityClient.fetch(commentQuery, {
  //   tweetId,
  // });

  return new NextResponse(JSON.stringify({}), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

type PostData = {
  message: string;
};

type CommentPostReq = {
  tweetId: string;
  cpmments: any[];
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tweetId, comments } = body;
  const driver = defineDriver();
  const session = driver.session();
  await write(
    session,
    `MATCH (t:Post { id: $tweetId })
    UNWIND $comments AS comment
    MATCH (commentUser:User {username: comment.username})
    CREATE (commentUser)-[:POSTED]->(c:Comment {
      id: comment.id,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      text: comment.text,
      username: comment.username,
      profileImg: comment.profileImg
    })
    CREATE (commentUser)-[:COMMENTED {timestamp: datetime(comment.createdAt)}]->(c)
    CREATE (c)-[:COMMENT_ON]->(t)`,
    { tweetId, comments }
  );

  const apiEndPoint = `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/${process.env.NEXT_PUBLIC_SANITY_DATASET}`;

  const result = await fetch(apiEndPoint, {
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${process.env.SANITY_API_TOKEN}`,
    },
    body: JSON.stringify({}),
    method: "POST",
  });

  const json = await result.json();

  return new NextResponse(JSON.stringify({}), {
    status: 201,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
