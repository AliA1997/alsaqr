import { faker } from "@faker-js/faker";
import { extractQryParams } from "@utils/common";
import { commonCountCipher } from "@utils/neo4j";
import { defineDriver, read, write } from "@utils/neo4j/neo4j";
import { PaginatedResult, Pagination } from "models/common";
import { int } from "neo4j-driver";
import { NextRequest, NextResponse } from "next/server";
import { CommunityRecord, CommunityToDisplay } from "typings";

async function GET(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const { user_id } = params;
  const userId = user_id as string;

  const [currentPage, itemsPerPage, searchTerm] = extractQryParams(request, ['currentPage', 'itemsPerPage', 'searchTerm']);
  const currentPageParsed = parseInt(currentPage!);
  const itemsPerPageParsed = parseInt(itemsPerPage!);

  let communities: CommunityToDisplay[] = [];
  let pagination: Pagination | undefined = undefined;
  
  if (!userId) {
    return new NextResponse("User must be logged in", { status: 400 });
  }

  const driver = defineDriver();
  const session = driver.session();

  try {
    let selectResult,  pagingResult, selectQuery;

    let pagingQuery = `SKIP $skip LIMIT $itemsPerPage`;

    if(searchTerm){
      selectQuery = `
          MATCH (u:User {id: $userId})-[:CREATED_COMMUNITY]->(community:Community)
          WHERE community.text CONTAINS $searchTerm
          OPTIONAL MATCH (community)-[:COMMUNITY_FOUNDER]->(founder:User)
          WITH community,
                founder
          RETURN community,
                  founder
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
        ["community", "founder"]
    );
      
      pagingResult = await read(
        session,
        commonCountCipher(selectQuery, 'community'),
        {
          userId,
          searchTerm: searchTerm ?? "",
        },
        'total'
      );
    } else {
      selectQuery = `
          MATCH (u:User {id: $userId})-[:CREATED_COMMUNITY]->(community:Community)
          OPTIONAL MATCH (community)-[:COMMUNITY_FOUNDER]->(founder:User)
          WITH community,
                founder
          RETURN community,
                  founder
      `;
      selectResult = await read(
        session,
        `${selectQuery} ${pagingQuery}`,
        {
          userId,
          skip: int((currentPageParsed - 1) *  itemsPerPageParsed),
          itemsPerPage: int(itemsPerPageParsed)
        },
        ["community", "founder"]
      );

      pagingResult = await read(
        session,
        commonCountCipher(selectQuery, 'community'),
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
    
    communities = selectResult ?? []; // Adjust based on your schema
    
  } catch (err) {
    return NextResponse.json({ message: "Fetch communities error!", success: false });
  }
  finally {
    await session.close();
  }

  return NextResponse.json({ 
      result: new PaginatedResult<any>(communities, pagination!) 
   });
}




async function POST(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const { values:data }: { values: CommunityRecord } = await request.json();
  const driver = defineDriver();
  const session = driver.session();
  const { user_id } = params;
  const userId = user_id as string;

  console.log('post community data:', data);
  if (!data.name) {
    return new NextResponse("Name of Community is required", { status: 400 });
  }

  try {
    await write(
      session,
      `
        // Create a new community record 
        MERGE (u:User {id: $userId})
        CREATE (cmty:Community {
          id: $id,
          userId: $userId,
          name: $name,
          avatar: $avatar,
          bannerImage: $bannerImage,
          createdAt: datetime($createdAt),
          updatedAt: datetime($updatedAt),
          _rev: "",
          _type: "community",
          isPrivate: $isPrivate,
          tags: []
        })
        CREATE (u)-[:CREATED_COMMUNITY {timestamp: datetime($createdAt)}]->(cmty)
        CREATE (cmty)-[:COMMUNITY_FOUNDER {timestamp: datetime($createdAt)}]->(u)
        `,
      data
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "Add community error!", success: false });
  } finally {
    await session.close();
  }
}


export { GET, POST };
