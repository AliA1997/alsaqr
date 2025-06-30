// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { extractQryParams } from "@utils/common";
import { commonCountCipher } from "@utils/neo4j";
import { defineDriver, read, write } from "@utils/neo4j/neo4j";
import { PaginatedResult, Pagination } from "models/common";
import { int } from "neo4j-driver";
import { NextRequest, NextResponse } from "next/server";
import { PostToDisplay } from "typings";


async function GET(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const driver = defineDriver();
  const session = driver.session();
  
  const [currentPage, itemsPerPage] = extractQryParams(request, ['currentPage', 'itemsPerPage']);
  const currentPageParsed = parseInt(currentPage!);
  const itemsPerPageParsed = parseInt(itemsPerPage!);
  const { user_id } = params;
  
  const id = user_id as string;
  let bookmarkedPosts: PostToDisplay[] = [];
  let pagination: Pagination | undefined = undefined;
  
  console.log('id:', id);
  if (!id) {
    return new NextResponse("You need to be logged in, in order to access  your bookmarks.", { status: 400 });
  }
  try {
    let selectResult,  pagingResult, selectQuery;

    let pagingQuery = `SKIP $skip LIMIT $itemsPerPage`;
    selectQuery = `
      MATCH (user:User {id: $id})-[:BOOKMARKED]->(pst:Post)
      OPTIONAL MATCH (postUser: User { id: pst.userId })
      OPTIONAL MATCH (pst)-[:COMMENT_ON]->(c:Comment)<-[:COMMENTED]-(u:User)
      OPTIONAL MATCH (pst)-[:REPOSTED]->(reposter:User)
      OPTIONAL MATCH (pst)-[:LIKED]->(liker:User)
      WITH pst as post, postUser.username as username, postUser.avatar as profileImg, COLLECT(DISTINCT c) AS comments, COLLECT(DISTINCT u) AS commenters, COLLECT(DISTINCT reposter) AS reposters, COLLECT(DISTINCT liker) AS likers
      ORDER BY post.createdAt DESCENDING
      RETURN post, username, profileImg, comments, commenters, reposters, likers
    `;
    pagingResult = await read(
      session,
      commonCountCipher(selectQuery, 'post'),
      {
        id
      },
      'total'
    );

    selectResult = await read(
                                session, 
                                `${selectQuery} ${pagingQuery}`,
                                { 
                                  id,
                                  skip: int((currentPageParsed - 1) *  itemsPerPageParsed),
                                  itemsPerPage: int(itemsPerPageParsed)
                                },
                                ["post", "username", "profileImg", "comments", "commenters", "reposters", "likers"]
                            );

    const pagingResultParsed = parseInt((pagingResult ?? ['0'])[0]);


    pagination = {
      itemsPerPage: itemsPerPageParsed,
      currentPage: currentPageParsed, 
      totalItems: pagingResultParsed,
      totalPages: pagingResultParsed > itemsPerPageParsed ? Math.round(pagingResultParsed / itemsPerPageParsed) : 1
    };
    bookmarkedPosts = selectResult ?? [];

    return NextResponse.json({ 
      result: new PaginatedResult<any>(bookmarkedPosts, pagination)
     });
  } catch (err) {
    return NextResponse.json({ message: "Add bookmarks error!", success: false });
  }
}


async function POST(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const body = await request.json();
  const driver = defineDriver();
  const session = driver.session();
  const { user_id } = params;
  const userId = user_id as string;
  const tweetId = body["tweetId"] ?? "";
  const isBookmarked = body["bookmarked"];

  if (!tweetId) {
    return new NextResponse("tweet ID is required", { status: 400 });
  }

  try {
    if (isBookmarked === false) {
      await write(
        session,
        `
            // Match the user node
            MERGE (u:User {id: $userId})
            // Match the tweet node
            MERGE (pst:Post {id: $tweetId})
            // Create the 'BOOKMARKED' relationship with a timestamp
            MERGE (u)-[r:BOOKMARKED]->(pst)
            ON CREATE SET r.timestamp = timestamp()
          `,
        { userId, tweetId }
      );

    } else if (isBookmarked === true) {
      await write(
        session,
        `
            // Match the user node
            MATCH (u:User {id: $userId})
            // Match the tweet node
            MATCH (t:Post {id: $tweetId})
            // Match the 'BOOKMARKED' relationship
            MATCH (u)-[r:BOOKMARKED]->(t)
            // Delete the relationship
            DELETE r
          `,
        { userId, tweetId }
      );
      
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "Add bookmarks error!", success: false });
  }
}

export { GET, POST };