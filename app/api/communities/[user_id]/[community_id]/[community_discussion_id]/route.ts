import { extractQryParams } from "@utils/common";
import { commonCountCipher } from "@utils/neo4j";
import { defineDriver, read } from "@utils/neo4j/neo4j";
import { PaginatedResult, Pagination } from "models/common";
import {  CommunityDiscussionMessageToDisplay } from "models/community";
import { int } from "neo4j-driver";
import { NextRequest, NextResponse } from "next/server";


async function GET(
  request: NextRequest,
  { params }: { params: { community_discussion_id: string } }
) {
  const { community_discussion_id } = params;
  const communityDiscussionId = community_discussion_id as string;

  const [currentPage, itemsPerPage, searchTerm] = extractQryParams(request, ['currentPage', 'itemsPerPage', 'searchTerm']);
  const currentPageParsed = parseInt(currentPage!);
  const itemsPerPageParsed = parseInt(itemsPerPage!);

  let communityDiscussionMessages: CommunityDiscussionMessageToDisplay[] = [];
  let pagination: Pagination | undefined = undefined;
  
  if (!communityDiscussionId) {
    return new NextResponse("Community Discussion must have an id", { status: 400 });
  }

  const driver = defineDriver();
  const session = driver.session();

  try {
    let selectResult,  pagingResult, selectQuery;

    let pagingQuery = `SKIP $skip LIMIT $itemsPerPage`;

    if(searchTerm){
      selectQuery = `
          MATCH (cd: CommunityDiscussion { id: $communityDiscussionId })-[:DISCUSSION_MESSAGE_POSTED]->(communityDiscussionMessage: CommunityDiscussionMessage)
          WHERE communityDiscussionMessage.messageText CONTAINS $searchTerm
          WITH communityDiscussionMessage
          RETURN communityDiscussionMessage
      `;

      selectResult = await read(
        session,
        `${selectQuery} ${pagingQuery}`,
        {
          communityDiscussionId,
          searchTerm: searchTerm ?? "",
          skip: int((currentPageParsed - 1) *  itemsPerPageParsed),
          itemsPerPage: int(itemsPerPageParsed)
        },
        ["communityDiscussionMessage"]
    );
      
      pagingResult = await read(
        session,
        commonCountCipher(selectQuery, 'communityDiscussionMessage'),
        {
          communityDiscussionId,
          searchTerm: searchTerm ?? "",
        },
        'total'
      );
    } else {
      selectQuery = `
          MATCH (cd: CommunityDiscussion { id: $communityDiscussionId })-[:DISCUSSION_MESSAGE_POSTED]->(communityDiscussionMessage: CommunityDiscussionMessage)
          WITH communityDiscussionMessage
          RETURN communityDiscussionMessage
      `;
      selectResult = await read(
        session,
        `${selectQuery} ${pagingQuery}`,
        {
          communityDiscussionId,
          skip: int((currentPageParsed - 1) *  itemsPerPageParsed),
          itemsPerPage: int(itemsPerPageParsed)
        },
        ["communityDiscussionMessage"]
      );

      pagingResult = await read(
        session,
        commonCountCipher(selectQuery, 'communityDiscussionMessage'),
        {
          communityDiscussionId
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
    
    communityDiscussionMessages = selectResult ?? []; // Adjust based on your schema
    
  } catch (err) {
    return NextResponse.json({ message: "Fetch community discussion messages error!", success: false });
  }
  finally {
    await session.close();
  }

  return NextResponse.json({ 
      result: new PaginatedResult<any>(communityDiscussionMessages, pagination!) 
   });
}
