// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { faker } from "@faker-js/faker";
import { extractQryParams } from "@utils/common";
import { commonCountCipher } from "@utils/neo4j";
import { defineDriver, read, write } from "@utils/neo4j/neo4j";
import { PaginatedResult, Pagination } from "models/common";
import { int } from "neo4j-driver";
import { NextRequest, NextResponse } from "next/server";
import { ListRecord, ListToDisplay } from "typings";

type Data = {
  message: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {

  const [currentPage, itemsPerPage, searchTerm] = extractQryParams(request, ['currentPage', 'itemsPerPage', 'searchTerm']);
  const currentPageParsed = parseInt(currentPage!);
  const itemsPerPageParsed = parseInt(itemsPerPage!);

  const driver = defineDriver();
  const session = driver.session();
  const { user_id } = params;

  const userId = user_id as string;
  let lists: ListToDisplay[] = [];
  let pagination: Pagination | undefined = undefined;

  // console.log("faker.datatype.uuid():", faker.datatype.uuid())
  try {
   let selectResult,  pagingResult, selectQuery;

    let pagingQuery = `SKIP $skip LIMIT $itemsPerPage`;

    if(searchTerm){
      selectQuery = `
        MATCH (u:User {id:  $userId})-[:CREATED_LIST]->(list:List)
        WHERE list.text CONTAINS $searchTerm
        OPTIONAL MATCH (list)-[:SAVED]->(savedByUser:User)
        WITH list,
              savedByUser AS savedBy
        ORDER BY list.createdAt DESCENDING
        RETURN list,
              savedBy
      `;
      selectResult = await read(
            session,
            `${selectQuery} ${pagingQuery}`,
            {
              userId,
              searchTerm: searchTerm ?? "",
              skip: int((currentPageParsed - 1) *  itemsPerPageParsed),
              itemsPerPage: int(itemsPerPageParsed)
            },
            ["list", "savedBy"]
          );
      
      pagingResult = await read(
          session,
          commonCountCipher(selectQuery, 'list'),
          {
            userId,
            searchTerm: searchTerm ?? "",
          },
          'total'
        );
    } else {
      selectQuery = `
        MATCH (u:User {id: $userId})-[:CREATED_LIST]->(list:List)
        OPTIONAL MATCH (list)-[:LIST_CREATOR]->(savedByUser:User)
        WITH list,
              savedByUser AS savedBy
        ORDER BY list.createdAt DESCENDING
        RETURN list,
              savedBy
      `;

      selectResult = await read(
        session,
        `${selectQuery} ${pagingQuery}`,
        {
          userId,
          skip: int((currentPageParsed - 1) *  itemsPerPageParsed),
          itemsPerPage: int(itemsPerPageParsed)
        },
        ["list", "savedBy"]
      );

      pagingResult = await read(
        session,
        commonCountCipher(selectQuery, 'list'),
        {
          userId
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
    lists = selectResult ?? []; // Adjust based on your schema
    // console.log('lists:', JSON.stringify(lists))
  } finally {
    await session.close();
  }

  return NextResponse.json({ 
      result: new PaginatedResult<any>(lists, pagination!) 
   });
}


export async function POST(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const { values:data }: { values: ListRecord }= await request.json();
  const driver = defineDriver();
  const session = driver.session();
  const { user_id } = params;
  const userId = user_id as string;

  if (!data.name) {
    return new NextResponse("Name of List is required", { status: 400 });
  }

  try {
    await write(
      session,
      `
        MERGE (u:User {id: $userId})
        CREATE (u)-[:CREATED_LIST]->(l:List {
          id: $id,
          userId: $userId, 
          name: $name, 
          avatar: $avatar,
          bannerImage: $bannerImage,
          createdAt: datetime($createdAt),
          updatedAt: datetime($updatedAt),
          _rev: "",
          _type: "list"
        })
        CREATE (l)-[:LIST_CREATOR {timestamp: datetime($createdAt)}]->(u)
      `,
      data
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "Add list error!", success: false });
  }
}

// }

// async function PATCH(
//   request: NextRequest,
//   { params }: { params: { user_id: string } }
// ) {
//   const body = await request.json();
//   const driver = defineDriver();
//   const session = driver.session();
//   const { user_id } = params;
//   const userId = user_id as string;
//   const listId = body["listId"] ?? "";
//   const tweetId = body["tweetId"] ?? "";
//   const isAdded = body["added"];

//   if (!tweetId) {
//     return new NextResponse("tweet ID is required", { status: 400 });
//   }

//   if (!listId) {
//     return new NextResponse("list ID is required", { status: 400 });
//   }

//   try {
//     if (isAdded === false) {
//       await write(
//         session,
//         `
//           // Match the user node
//           MERGE (u:User {id: $userId})
//           // Match the tweet node
//           MERGE (t:Post {id: $tweetId})
//           // Match the list node
//           MERGE (l:List {id: $listId})
//           // Ensure the user owns the list
//           MERGE (u)-[:OWNS]->(l)
//           // Create the 'CONTAINS' relationship between the list and the tweet with a timestamp
//           MERGE (l)-[r:CONTAINS]->(t)
//           ON CREATE SET r.timestamp = timestamp()
//           `,
//         { userId, tweetId, listId }
//       );
//     } else if (isAdded === true) {
//       await write(
//         session,
//         `
//           // Match the user node
//           MATCH (u:User {id: $userId})
//           // Match the list node
//           MATCH (l:List {id: $listId})
//           // Ensure the user owns the list
//           MATCH (u)-[:OWNS]->(l)
//           // Match and delete the 'CONTAINS' relationships between the list and any tweets
//           OPTIONAL MATCH (l)-[r:CONTAINS]->(t:Post)
//           DELETE r
//           // Delete the 'OWNS' relationship and the list node
//           WITH l
//           OPTIONAL MATCH (u)-[o:OWNS]->(l)
//           DELETE o, l

//           `,
//         { userId, listId }
//       );
//     }

//     return NextResponse.json({ success: true });
//   } catch (err) {
//     return NextResponse.json({ message: "Patch list error!", success: false });
//   }
// }
