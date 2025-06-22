import { faker } from "@faker-js/faker";
import { extractQryParams } from "@utils/common";
import { commonCountCipher } from "@utils/neo4j";
import { defineDriver, read, write } from "@utils/neo4j/neo4j";
import { PaginatedResult } from "models/common";
import { int } from "neo4j-driver";
import { NextRequest, NextResponse } from "next/server";
import { NotificationType } from "typings.d";

async function GET(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const driver = defineDriver();
  const session = driver.session();
  const { user_id } = params;
  const [type, currentPage, itemsPerPage] = extractQryParams(request, ['type', 'currentPage', 'itemsPerPage']);
  const currentPageParsed = parseInt(currentPage!);
  const itemsPerPageParsed = parseInt(itemsPerPage!);
  
  const notificationType = type ? NotificationType[type as keyof typeof NotificationType] : NotificationType.Normal;

  if (!user_id) {
    return new NextResponse("You need to be logged in, in order to access your notifications.", { status: 400 });
  }

  try {
    const notificationRelationship =
      notificationType === NotificationType.Mentioned ? '[:MENTION_NOTIFICATION]->(notification: Notification)'
        : notificationType === NotificationType.Verified ? '[:VERIFIED_NOTIFICATION]->(notification: Notification)'
          : '[:NORMAL_NOTIFICATION]->(notification: Notification)';

    let selectResult,  pagingResult, selectQuery;

    let pagingQuery = `SKIP $skip LIMIT $itemsPerPage`;
    
    selectQuery =  `
        MATCH (u:User {id: $userId})-${notificationRelationship}
        WITH community,
              COLLECT(DISTINCT joinedUser) AS joinedUsers
        RETURN notification                              
    `;

    selectResult = await read(
          session,
          `${selectQuery} ${pagingQuery}`,
          {
            skip: int((currentPageParsed - 1) *  itemsPerPageParsed),
            itemsPerPage: int(itemsPerPageParsed)
          },
          'notification'
    );

    pagingResult = await read(
      session,
      commonCountCipher(selectQuery, 'notification'),
      {},
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
    return NextResponse.json({ message: "Get notifications error!", success: false });
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
  const text = body["text"] ?? "";
  const image = body["image"] ?? "";
  const username = body["username"] ?? "";
  const profileImg = body["profileImg"] ?? "";
  const type = body["type"] ? NotificationType[body.type as keyof typeof NotificationType] : NotificationType.Normal;


  if (!text) {
    return new NextResponse("Name of List is required", { status: 400 });
  }

  try {
    const notificationRelationship =
      type === NotificationType.Mentioned ? 'CREATE (u)-[mr: MENTION_NOTIFICATION]->(n)'
        : type === NotificationType.Verified ? 'CREATE (u)-[vr: VERIFIED_NOTIFICATION]->(n)'
          : 'CREATE (u)-[nr: NORMAL_NOTIFICATION]->(n)';

    await write(
      session,
      `
        // Create a new notification record 
        MERGE (u:User {id: $userId})
        CREATE (u)-[:NEW_NOTIFICATION]->(n:Notification {
          id: $id,
          createdAt: datetime(),
          updatedAt: null,  
          userId: $userId, 
          name: $name,
          image: $image, 
          username: $username, 
          profileImg: $profileImg,
          notificationType: $type
        })
        ${notificationRelationship}
        CREATE (u)-[:NOTIFIED_BY {timestamp: datetime($createdAt)}]->(n)
        `,
      { id: faker.datatype.uuid(), userId, text, image, username, profileImg, type }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "Add notification error!", success: false });
  }
}



export { GET, POST };