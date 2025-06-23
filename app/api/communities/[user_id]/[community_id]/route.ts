import { extractQryParams } from "@utils/common";
import { commonCountCipher } from "@utils/neo4j";
import { defineDriver, read } from "@utils/neo4j/neo4j";
import { PaginatedResult, Pagination } from "models/common";
import { CommunityDiscussionToDisplay } from "models/community";
import { int } from "neo4j-driver";
import { NextRequest, NextResponse } from "next/server";


async function GET(
  request: NextRequest,
  { params }: { params: { community_id: string } }
) {
  const { community_id } = params;
  const communityId = community_id as string;

  const [currentPage, itemsPerPage, searchTerm] = extractQryParams(request, ['currentPage', 'itemsPerPage', 'searchTerm']);
  const currentPageParsed = parseInt(currentPage!);
  const itemsPerPageParsed = parseInt(itemsPerPage!);

  let communityDiscussions: CommunityDiscussionToDisplay[] = [];
  let pagination: Pagination | undefined = undefined;
  
  if (!communityId) {
    return new NextResponse("Community must have an id", { status: 400 });
  }

  const driver = defineDriver();
  const session = driver.session();

  try {
    let selectResult,  pagingResult, selectQuery;

    let pagingQuery = `SKIP $skip LIMIT $itemsPerPage`;

    if(searchTerm){
      selectQuery = `
          MATCH (community:Community { id: $communityId })-[:DISCUSSION_POSTED]->(communityDiscussion: CommunityDiscussion)
          WHERE communityDiscussion.name CONTAINS $searchTerm
          WITH communityDiscussion
          RETURN communityDiscussion
      `;

      selectResult = await read(
        session,
        `${selectQuery} ${pagingQuery}`,
        {
          communityId,
          searchTerm: searchTerm ?? "",
          skip: int((currentPageParsed - 1) *  itemsPerPageParsed),
          itemsPerPage: int(itemsPerPageParsed)
        },
        ["communityDiscussion"]
    );
      
      pagingResult = await read(
        session,
        commonCountCipher(selectQuery, 'communityDiscussion'),
        {
          communityId,
          searchTerm: searchTerm ?? "",
        },
        'total'
      );
    } else {
      selectQuery = `
          MATCH (community:Community { id: $communityId })-[:DISCUSSION_POSTED]->(communityDiscussion: CommunityDiscussion)
          WITH communityDiscussion
          RETURN communityDiscussion
      `;
      selectResult = await read(
        session,
        `${selectQuery} ${pagingQuery}`,
        {
          communityId,
          skip: int((currentPageParsed - 1) *  itemsPerPageParsed),
          itemsPerPage: int(itemsPerPageParsed)
        },
        ["communityDiscussion"]
      );

      pagingResult = await read(
        session,
        commonCountCipher(selectQuery, 'communityDiscussion'),
        {
          communityId
        },
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
    
    communityDiscussions = selectResult ?? []; // Adjust based on your schema
    
  } catch (err) {
    return NextResponse.json({ message: "Fetch community discussions error!", success: false });
  }
  finally {
    await session.close();
  }

  return NextResponse.json({ 
      result: new PaginatedResult<any>(communityDiscussions, pagination!) 
   });
}
