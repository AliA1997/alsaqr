import { extractQryParams } from "@utils/common";
import { commonCountCipher } from "@utils/neo4j";
import { defineDriver, read } from "@utils/neo4j/neo4j";
import { PaginatedResult, Pagination } from "models/common";
import { int } from "neo4j-driver";
import { NextRequest, NextResponse } from "next/server";
import { MessageHistoryToDisplay, MessageToDisplay, MessageType } from "typings.d";

async function GET_DIRECT_MESSAGE_HISTORY(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const driver = defineDriver();
  const session = driver.session();
  
  const [currentPage, itemsPerPage] = extractQryParams(request, ['currentPage', 'itemsPerPage']);
  const currentPageParsed = parseInt(currentPage!);
  const itemsPerPageParsed = parseInt(itemsPerPage!);
  const { user_id } = params;


  if (!user_id) {
    return new NextResponse("You need to be logged in, in order to access your direct messages.", { status: 400 });
  }

  let messageHistoryItems: MessageHistoryToDisplay[] = [];
  let pagination: Pagination;

  try {
    let pagingQuery = `SKIP $skip LIMIT $itemsPerPage`;

    let selectResult, pagingResult, selectQuery;
    selectQuery = `
      // First match both users using parameters
      MATCH (sender:User { id: $senderId })
      MATCH (receiver:User)

      // Find all messages between these users in either direction
      MATCH (message:Message)
      WHERE (message.senderId = sender.id AND message.recipientId = receiver.id)
        OR (message.senderId = receiver.id AND message.recipientId = sender.id)

      // Aggregate the results
      WITH receiver, 
          count(message) AS messageCount, 
          max(message.createdAt) AS lastMessageTimestamp

      // Return in the requested format
      RETURN randomUUID() as id,
        receiver.id as receiverId,
        receiver.avatar as receiverProfileImage,
        receiver.username as receiverUsername,
        messageCount,
       datetime(lastMessageTimestamp) as lastMessageDate
    `;

    selectResult = await read(
      session,
      `${selectQuery} ${pagingQuery}`,
      {
        senderId: user_id,
        skip: int((currentPageParsed - 1) *  itemsPerPageParsed),
        itemsPerPage: int(itemsPerPageParsed),
      },
      ['id', 'receiverId', 'receiverProfileImage', 'receiverUsername', 'messageCount', 'lastMessageDate']
    );

    pagingResult = await read(
      session,
      `
        // First match both users using parameters
        MATCH (sender:User { id: $senderId })
        MATCH (receiver:User)

        // Find all messages between these users in either direction
        MATCH (message:Message)
        WHERE (message.senderId = sender.id AND message.recipientId = receiver.id)
          OR (message.senderId = receiver.id AND message.recipientId = sender.id)

        // Aggregate the results
        WITH receiver, count(message) AS totalMessages, max(message.createdAt) AS lastMessageTimestamp

        // Return in the requested format
        RETURN count(receiver.id) as total
      `,
      {
        senderId: user_id,
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

    messageHistoryItems = selectResult ?? [];

    // console.log('messageHistoryItems:', messageHistoryItems)

  } catch (err) {
    return NextResponse.json({ message: "Get direct message history error!", success: false });
  } finally {
    return NextResponse.json({
      result: new PaginatedResult<any>(messageHistoryItems, pagination!) 
    });
  }
}

export { GET_DIRECT_MESSAGE_HISTORY as GET };