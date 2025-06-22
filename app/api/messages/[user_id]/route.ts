import { extractQryParams } from "@utils/common";
import { commonCountCipher } from "@utils/neo4j";
import { defineDriver, read } from "@utils/neo4j/neo4j";
import { PaginatedResult } from "models/common";
import { int } from "neo4j-driver";
import { NextRequest, NextResponse } from "next/server";
import { MessageType } from "typings.d";

async function GET(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const driver = defineDriver();
  const session = driver.session();
  
  const [type, currentPage, itemsPerPage] = extractQryParams(request, ['messageType', 'currentPage', 'itemsPerPage']);
  const currentPageParsed = parseInt(currentPage!);
  const itemsPerPageParsed = parseInt(itemsPerPage!);
  const { user_id } = params;
  const messageType = type ? MessageType[type as keyof typeof MessageType] : MessageType.All;
  
  if (!user_id) {
    return new NextResponse("You need to be logged in, in order to access your notifications.", { status: 400 });
  }

  try {
    const queryCondition =
      messageType === MessageType.Sent 
      ? `
        MATCH (sender: User {id: $userId})-[:SEND_MESSAGE]->(message: Message)
      ` : `
        // Messages where the user is the recipient
        MATCH (recipient:User {id: $userId})-[:RECEIVED_MESSAGE]->(message:Message)
        RETURN message

        UNION

        // Messages where the user is the sender
        MATCH (sender:User {id: $userId})-[:SEND_MESSAGE]->(message:Message)
        RETURN message
      `;

    let pagingQuery = `SKIP $skip LIMIT $itemsPerPage`;

    let selectResult,  pagingResult, selectQuery;
    selectQuery = `
        ${queryCondition}
        WITH message
        RETURN message                               
    `;

    selectResult = await read(
          session,
          `${selectQuery} ${pagingQuery}`,
          {
            skip: int((currentPageParsed - 1) *  itemsPerPageParsed),
            itemsPerPage: int(itemsPerPageParsed),
            userId: user_id
          },
          'message'
    );

    pagingResult = await read(
      session,
      commonCountCipher(selectQuery, 'message'),
      {userId: user_id},
      'total'
    );

    const pagingResultParsed = parseInt((pagingResult ?? ['0'])[0]);

    const pagination = {
      itemsPerPage: itemsPerPageParsed,
      currentPage: currentPageParsed, 
      totalItems: pagingResultParsed,
      totalPages: pagingResultParsed / itemsPerPageParsed
    };

    return NextResponse.json({
      result: new PaginatedResult<any>(selectResult ?? [], pagination!) 
    });
  } catch (err) {
    return NextResponse.json({ message: "Get messages error!", success: false });
  }
}

export { GET };