import { extractQryParams } from "@utils/common";
import { commonCountCipher } from "@utils/neo4j";
import { defineDriver, read } from "@utils/neo4j/neo4j";
import { PaginatedResult, Pagination } from "models/common";
import { int } from "neo4j-driver";
import { NextRequest, NextResponse } from "next/server";
import { MessageToDisplay, MessageType } from "typings.d";

async function GET(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const driver = defineDriver();
  const session = driver.session();
  
  const [senderId, receiverId, currentPage, itemsPerPage] = extractQryParams(request, ['senderId', 'receiverId', 'currentPage', 'itemsPerPage']);
  const currentPageParsed = parseInt(currentPage!);
  const itemsPerPageParsed = parseInt(itemsPerPage!);
  const { user_id } = params;
  
  console.log('senderId:', senderId);
  console.log('receiverId:', receiverId);
  if (!user_id) {
    return new NextResponse("You need to be logged in, in order to access your direct messages.", { status: 400 });
  }

  let messages: MessageToDisplay[] = [];
  let pagination: Pagination;

  try {
    let pagingQuery = `SKIP $skip LIMIT $itemsPerPage`;

    let selectResult, pagingResult, selectQuery;
    selectQuery = `
      MATCH (message:Message { senderId: $senderId, recipientId: $recipientId})
        RETURN message

      UNION

      MATCH (message:Message { senderId: $recipientId, recipientId: $senderId})
        RETURN message
    `;

    selectResult = await read(
      session,
      `${selectQuery} ${pagingQuery}`,
      {
        senderId,
        recipientId: receiverId,
        skip: int((currentPageParsed - 1) *  itemsPerPageParsed),
        itemsPerPage: int(itemsPerPageParsed),
      },
      ['message']
    );

    pagingResult = await read(
      session,
      commonCountCipher(selectQuery, 'message'),
      {
        senderId,
        recipientId: receiverId,
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

    messages = selectResult ?? [];


  } catch (err) {
    return NextResponse.json({ message: "Get direct messages error!", success: false });
  } finally {
    return NextResponse.json({
      result: new PaginatedResult<any>(messages, pagination!) 
    });
  }
}

export { GET };