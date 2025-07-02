import { faker } from "@faker-js/faker";
import { extractQryParams } from "@utils/common";
import { commonCountCipher } from "@utils/neo4j";
import { defineDriver, read, write } from "@utils/neo4j/neo4j";
import { PaginatedResult, Pagination } from "models/common";
import { int } from "neo4j-driver";
import { NextRequest, NextResponse } from "next/server";
import { NotificationToDisplay } from "typings.d";

async function GET_NOTIFICATIONS(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const driver = defineDriver();
  const session = driver.session();
  const { user_id } = params;
  const [currentPage, itemsPerPage, all] = extractQryParams(request, ['currentPage', 'itemsPerPage', 'all']);
  const currentPageParsed = parseInt(currentPage!);
  const itemsPerPageParsed = parseInt(itemsPerPage!);
  
  const getAll = (all === 'true')

  if (!user_id) {
    return new NextResponse("You need to be logged in, in order to access your notifications.", { status: 400 });
  }

  let notifications: NotificationToDisplay[] | undefined;
  let pagination: Pagination | undefined;

  console.log('getAll:', getAll);
  console.log('userId:', user_id);
  try {

    let selectResult,  pagingResult, selectQuery;

    let pagingQuery = `SKIP $skip LIMIT $itemsPerPage`;
    
    selectQuery =  `
        MATCH (user:User {id: $userId})-[:NOTIFIED_BY]->(notification:Notification { read: $read })
        WITH notification
        RETURN notification                         
    `;

    selectResult = await read(
          session,
          `${selectQuery} ${pagingQuery}`,
          {
            userId: user_id,
            read: !getAll,
            skip: int((currentPageParsed - 1) *  itemsPerPageParsed),
            itemsPerPage: int(itemsPerPageParsed)
          },
          ['notification']
    );

    pagingResult = await read(
      session,
      commonCountCipher(selectQuery, 'notification'),
      {
        userId: user_id,
        read: !getAll,
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

    notifications = selectResult ?? [];
     
  } catch (err) {
    return NextResponse.json({ message: "Get notifications error!", success: false });
  }

  return NextResponse.json({ 
    result: new PaginatedResult<any>(notifications, pagination!) 
  });
}

export { GET_NOTIFICATIONS as GET };