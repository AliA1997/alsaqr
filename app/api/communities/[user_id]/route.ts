import { faker } from "@faker-js/faker";
import { extractQryParams } from "@utils/common";
import { commonCountCipher } from "@utils/neo4j";
import { defineDriver, read, write } from "@utils/neo4j/neo4j";
import { PaginatedResult, Pagination } from "models/common";
import { int } from "neo4j-driver";
import { NextRequest, NextResponse } from "next/server";
import { CommunityToDisplay, CreateListOrCommunityFormDto } from "typings";

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
        // Communities where user is the founder (userId matches)
        MATCH (community:Community { userId: $userId })
        RETURN community, 'FOUNDER' AS relationshipType

        UNION

        // Communities that invited users
        MATCH (community:Community)
        WHERE EXISTS {
          MATCH (community)-[:INVITED]->(:User)
        }
        RETURN community, 'INVITED' AS relationshipType

        UNION

        // Communities that users joined
        MATCH (community:Community)
        WHERE EXISTS {
          MATCH (:User)-[:JOINED]->(community)
        }
        RETURN community, 'JOINED' AS relationshipType
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
        ["community", "relationshipType"]
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
        // Communities where user is the founder (userId matches)
        MATCH (community:Community { userId: $userId })
        RETURN community, 'FOUNDER' AS relationshipType

        UNION

        // Communities that invited users
        MATCH (community:Community)
        WHERE EXISTS {
          MATCH (community)-[:INVITED]->(:User)
        }
        RETURN community, 'INVITED' AS relationshipType

        UNION

        // Communities that users joined
        MATCH (community:Community)
        WHERE EXISTS {
          MATCH (:User)-[:JOINED]->(community)
        }
        RETURN community, 'JOINED' AS relationshipType
      `;
      selectResult = await read(
        session,
        `${selectQuery} ${pagingQuery}`,
        {
          userId,
          skip: int((currentPageParsed - 1) *  itemsPerPageParsed),
          itemsPerPage: int(itemsPerPageParsed)
        },
        ["community", "relationshipType"]
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
  const { values:data }: { values: CreateListOrCommunityFormDto } = await request.json();
  const driver = defineDriver();
  const session = driver.session();
  const { user_id } = params;
  const userId = user_id as string;

  console.log('post community data:', data);
  if (!data.name) {
    return new NextResponse("Name of Community is required", { status: 400 });
  }
  try {
    const communityId = `community_${faker.datatype.uuid()}`;

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
          bannerImage: null,
          createdAt: datetime(),
          updatedAt: null,
          _rev: "",
          _type: "community",
          isPrivate: $isPrivate,
          tags: $tags
        })
        CREATE (u)-[:CREATED_COMMUNITY {timestamp: datetime()}]->(cmty)
        CREATE (cmty)-[:COMMUNITY_FOUNDER {timestamp: datetime()}]->(u)
        `,
      {
        id: communityId,
        userId,
        name: data.name,
        avatar: data.avatarOrBannerImage,
        isPrivate: (data.isPrivate === 'private'),
        tags: data.tags
      }
    );

    await write(
      session,
      `
        UNWIND $usersAdded AS usersAddedId
        MATCH (cmty: Community {id: $communityId}), (user:User {id: usersAddedId})
        MERGE (cmty)-[r:INVITED]->(user)
        SET r.createdAt = datetime()
        RETURN count(r) AS relationshipsCreated
      `,
      {
        communityId,
        usersAdded: data.usersAdded
      }
    )

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "Add community error!", success: false });
  } finally {
    await session.close();
  }
}


export { GET, POST };
