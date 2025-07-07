import { NextRequest, NextResponse } from "next/server";
import { defineDriver, read, write } from "@utils/neo4j/neo4j";
import { extractQryParams } from "@utils/common";
import { PostRecord, PostToDisplay } from "typings";
import { int } from 'neo4j-driver';
import { commonCountCipher } from "@utils/neo4j";
import { PaginatedResult, Pagination } from "models/common";

async function GET(request: NextRequest) {
  const [currentPage, itemsPerPage, searchTerm] = extractQryParams(request, ['currentPage', 'itemsPerPage', 'searchTerm']);
  const currentPageParsed = parseInt(currentPage!);
  const itemsPerPageParsed = parseInt(itemsPerPage!);
  
  const driver = defineDriver();
  const session = driver.session();
  let posts: PostToDisplay[] = [];
  let pagination: Pagination | undefined = undefined;

  try {

    let selectResult,  pagingResult, selectQuery;

    let pagingQuery = `SKIP $skip LIMIT $itemsPerPage`;
    if(searchTerm) {
      selectQuery = `
                MATCH (post:Post), (user: User { id: post.userId })
                WHERE post.text CONTAINS $searchTerm
                OPTIONAL MATCH (post)<-[:COMMENT_ON]-(c:Comment)<-[:COMMENTED]-(u:User)
                OPTIONAL MATCH (post)-[:RETWEETS]->(reposter:User)
                OPTIONAL MATCH (post)-[:LIKED]->(liker:User)
                WITH post,
                    user.username as username,
                    user.avatar as profileImg,
                    COLLECT(DISTINCT c) AS comments,
                    COLLECT(DISTINCT u) AS commenters,
                    COLLECT(DISTINCT reposter) AS reposters,
                    COLLECT(DISTINCT liker) AS likers
                ORDER BY post.createdAt DESCENDING
                RETURN post,
                      username,
                      profileImg,
                      comments,
                      commenters,
                      reposters,
                      likers
      `;
      selectResult = await read(
                  session,
                  `${selectQuery} ${pagingQuery}`,
                  {
                    searchTerm: searchTerm ?? "",
                    skip: int((currentPageParsed - 1) *  itemsPerPageParsed),
                    itemsPerPage: int(itemsPerPageParsed)
                  },
                  ["post", "username", "profileImg", "comments", "commenters", "reposters", "likers"]
                );
    pagingResult = await read(
        session,
        commonCountCipher(selectQuery, 'post'),
        {
          searchTerm: searchTerm ?? "",
        },
        'total'
      );
    } else {
      selectQuery = `
        MATCH (post:Post), (user: User { id: post.userId })
        OPTIONAL MATCH (post)<-[:COMMENT_ON]-(c:Comment)<-[:COMMENTED]-(u:User)
        OPTIONAL MATCH (post)-[:RETWEETS]->(reposter:User)
        OPTIONAL MATCH (post)-[:LIKED]->(liker:User)
        WITH post,
            user.username as username,
            user.avatar as profileImg,
            COLLECT(DISTINCT c) AS comments,
            COLLECT(DISTINCT u) AS commenters,
            COLLECT(DISTINCT reposter) AS reposters,
            COLLECT(DISTINCT liker) AS likers
        ORDER BY post.createdAt DESCENDING
        RETURN post,
              username, 
              profileImg,
              comments,
              commenters,
              reposters,
              likers
      `;
      selectResult = await read(
          session,
          `${selectQuery} ${pagingQuery}`,
          {
            skip: int((currentPageParsed - 1) *  itemsPerPageParsed),
            itemsPerPage: int(itemsPerPageParsed)
          },
          ["post", "username", "profileImg", "comments", "commenters", "reposters", "likers"]
        );
      pagingResult = await read(
        session,
        commonCountCipher(selectQuery, 'post'),
        {},
        'total'
      );
    }        

    const pagingResultParsed = parseInt((pagingResult ?? ['0'])[0]);

    pagination = {
      itemsPerPage: itemsPerPageParsed,
      currentPage: currentPageParsed, 
      totalItems: pagingResultParsed,
      totalPages: pagingResultParsed / itemsPerPageParsed
    };
    posts = selectResult ?? []; // Adjust based on your schema
  } finally {
    await session.close();
  }

  return NextResponse.json({ 
    result: new PaginatedResult<any>(posts, pagination!) 
  });
}

// type Data = {
//   message: string;
// };

async function POST(request: NextRequest) {
  const { values:data }: { values: PostRecord } = await request.json();
  const driver = defineDriver();
  const session = driver.session();

  try {
    if (!data.text) throw new Error("Post requires text.");

    console.log("userID:", data.userId);
    await write(
      session,
      `
      MATCH (u:User {id: $userId})
      CREATE (u)-[:POSTED]->(t:Post {
        id: $id,
        createdAt: datetime(),
        updatedAt: datetime(),
        _rev: $_rev,
        _type: $_type,
        blockTweet: $blockTweet,
        text: $text,
        userId: $userId,
        image: $image,
        tags: $tags
      })
      `,
      { ...data}
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
export { GET, POST };
