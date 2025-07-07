import { extractQryParams } from "@utils/common";
import { commonCountCipher } from "@utils/neo4j";
import { defineDriver, read } from "@utils/neo4j/neo4j";
import { m } from "framer-motion";
import { PaginatedResult, Pagination } from "models/common";
import { int } from "neo4j-driver";
import { NextRequest, NextResponse } from "next/server";
import { CommentToDisplay } from "typings";



async function GET_COMMENTS_FOR_POST(
  request: NextRequest,
  { params }: { params: { tweet_id: string } }
) {
const [currentPage, itemsPerPage, searchTerm] = extractQryParams(request, ['currentPage', 'itemsPerPage', 'searchTerm']);
const currentPageParsed = parseInt(currentPage!);
const itemsPerPageParsed = parseInt(itemsPerPage!);
      
  const { tweet_id } = params;
  const tweetId = tweet_id as string;

  if (!tweetId) {
    return new NextResponse("Post ID is required", { status: 400 });
  }

  const driver = defineDriver();
  const session = driver.session();
  let comments: CommentToDisplay[] = [];
  let pagination: Pagination | undefined = undefined;

  
  try {
    
    let selectResult,  pagingResult, selectQuery;
    let pagingQuery = `SKIP $skip LIMIT $itemsPerPage`;

    // Adjust the Cypher query to fetch the tweet by ID
      selectQuery = `
        MATCH (c:Comment)-[:COMMENT_ON]->(post:Post {id: $tweetId})
        MATCH (u:User)-[:COMMENTED]->(c)
        OPTIONAL MATCH (c)-[:COMMENT_HAS_COMMENT]->(cmtCmt:Comment)<-[:COMMENTED_ON_COMMENT]-(cmtCmtUser:User)
        OPTIONAL MATCH (c)-[:COMMENT_REPOSTS]->(reposter:User)
        OPTIONAL MATCH (c)-[:COMMENT_LIKED]->(liker:User)
        WITH u.id as userId, 
            u.username as username,
            u.avatar as profileImg,
            COLLECT(DISTINCT cmtCmtUser) AS commenters,
            COLLECT(DISTINCT cmtCmt) AS comments,
            COLLECT(DISTINCT reposter) AS reposters,
            COLLECT(DISTINCT liker) AS likers,
            c
        RETURN c.id as id,
                c.postId as postId,
                userId as userId,
                c.image as image,
                c.text as text,
                c.createdAt as createdAt,
                username,
                profileImg,
                commenters,
                comments,
                reposters,
                likers
      `;
      
      selectResult = await read(
          session,
          `${selectQuery} ${pagingQuery}`,
          {
            tweetId,
            skip: int((currentPageParsed - 1) *  itemsPerPageParsed),
            itemsPerPage: int(itemsPerPageParsed)
          },
          [
            "id", "postId", "userId", "image", "text", 
            "createdAt", "username", "profileImg",
            "commenters", "comments", "reposters", "likers"
        ]
        );
      pagingResult = await read(
        session,
        commonCountCipher(selectQuery, 'c'),
        {
            tweetId
        },
        'total'
      );

    const pagingResultParsed = parseInt((pagingResult ?? ['0'])[0]);

    pagination = {
      itemsPerPage: itemsPerPageParsed,
      currentPage: currentPageParsed, 
      totalItems: pagingResultParsed,
      totalPages: pagingResultParsed / itemsPerPageParsed
    };


    comments = selectResult ?? [];

  } catch (err) {
    return NextResponse.json({ message: "Fetch Comments for psot error!", success: false });

  }

    return NextResponse.json({ 
        result: new PaginatedResult<any>(comments, pagination)
    });
}

export {
    GET_COMMENTS_FOR_POST as GET
}