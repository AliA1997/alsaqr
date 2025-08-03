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
        MATCH (user:User {id: $userId})

        // Get all communities in the database
        MATCH (community:Community)

        // Get founder for each community (regardless of user relationship)
        OPTIONAL MATCH (community)-[:COMMUNITY_FOUNDER]->(founder:User)

        // Determine the user's relationship to each community
        WITH community, founder, user,
            CASE
              WHEN EXISTS((community)-[:INVITE_REQUESTED]->(user)) THEN 'INVITE_REQUESTED'
              WHEN EXISTS((community)-[:COMMUNITY_FOUNDER]->(user)) THEN 'FOUNDER'
              WHEN EXISTS((community)-[:INVITED]->(user)) THEN 'INVITED'
              WHEN EXISTS((user)-[:JOINED]->(community)) THEN 'JOINED'
              ELSE 'NONE'
            END AS relationshipType

        // Return all communities with their relationship status
        RETURN DISTINCT
          community,
          founder,
          relationshipType
        ORDER BY relationshipType, community.name
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
        ["community", "founder", "relationshipType"]
    );
      
      pagingResult = await read(
        session,
        `
        MATCH (user:User {id: $userId})

        // Get all communities in the database
        MATCH (community:Community)

        // Get founder for each community (regardless of user relationship)
        OPTIONAL MATCH (community)-[:COMMUNITY_FOUNDER]->(founder:User)

        // Determine the user's relationship to each community
        WITH community, founder, user,
            CASE
              WHEN EXISTS((community)-[:INVITE_REQUESTED]->(user)) THEN 'INVITE_REQUESTED'
              WHEN EXISTS((community)-[:COMMUNITY_FOUNDER]->(user)) THEN 'FOUNDER'
              WHEN EXISTS((community)-[:INVITED]->(user)) THEN 'INVITED'
              WHEN EXISTS((user)-[:JOINED]->(community)) THEN 'JOINED'
              ELSE 'NONE'
            END AS relationshipType

        // Return all communities with their relationship status
        RETURN COUNT(DISTINCT community) as total
        `,
        {
          userId,
          searchTerm: searchTerm ?? "",
        },
        'total'
      );
    } else {
      selectQuery = `
        MATCH (user:User {id: $userId})

        // Get all communities in the database
        MATCH (community:Community)

        // Get founder for each community (regardless of user relationship)
        OPTIONAL MATCH (community)-[:COMMUNITY_FOUNDER]->(founder:User)

        // Determine the user's relationship to each community
        WITH community, founder, user,
            CASE
              WHEN EXISTS((community)-[:INVITE_REQUESTED]->(user)) THEN 'INVITE_REQUESTED'
              WHEN EXISTS((community)-[:COMMUNITY_FOUNDER]->(user)) THEN 'FOUNDER'
              WHEN EXISTS((community)-[:INVITED]->(user)) THEN 'INVITED'
              WHEN EXISTS((user)-[:JOINED]->(community)) THEN 'JOINED'
              ELSE 'NONE'
            END AS relationshipType

        // Return all communities with their relationship status
        RETURN DISTINCT
          community,
          founder,
          relationshipType
        ORDER BY relationshipType, community.name
      `;
      selectResult = await read(
        session,
        `${selectQuery} ${pagingQuery}`,
        {
          userId,
          skip: int((currentPageParsed - 1) *  itemsPerPageParsed),
          itemsPerPage: int(itemsPerPageParsed)
        },
        ["community", "founder", "relationshipType"]
      );

      pagingResult = await read(
        session,
        `
        MATCH (user:User {id: $userId})

        // Get all communities in the database
        MATCH (community:Community)

        // Get founder for each community (regardless of user relationship)
        OPTIONAL MATCH (community)-[:COMMUNITY_FOUNDER]->(founder:User)

        // Determine the user's relationship to each community
        WITH community, founder, user,
            CASE
              WHEN EXISTS((community)-[:INVITE_REQUESTED]->(user)) THEN 'INVITE_REQUESTED'
              WHEN EXISTS((community)-[:COMMUNITY_FOUNDER]->(user)) THEN 'FOUNDER'
              WHEN EXISTS((community)-[:INVITED]->(user)) THEN 'INVITED'
              WHEN EXISTS((user)-[:JOINED]->(community)) THEN 'JOINED'
              ELSE 'NONE'
            END AS relationshipType

        // Return all communities with their relationship status
        RETURN COUNT(DISTINCT community) as total
        `,
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
