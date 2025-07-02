import { faker } from "@faker-js/faker";
import { extractQryParams } from "@utils/common";
import { commonCountCipher } from "@utils/neo4j";
import { defineDriver, read, write } from "@utils/neo4j/neo4j";
import { PaginatedResult, Pagination } from "models/common";
import { CommunityDiscussionToDisplay } from "models/community";
import { int } from "neo4j-driver";
import { NextRequest, NextResponse } from "next/server";
import { CreateListOrCommunityFormDto } from "typings";


async function GET_COMMUNITY_DISCUSSIONS(
  request: NextRequest,
  { params }: { params: { user_id: string, community_id: string } }
) {
  const { user_id, community_id } = params;
  const communityId = community_id as string;
  const userId = user_id as string;

  const [currentPage, itemsPerPage, searchTerm] = extractQryParams(request, ['currentPage', 'itemsPerPage', 'searchTerm']);
  const currentPageParsed = parseInt(currentPage!);
  const itemsPerPageParsed = parseInt(itemsPerPage!);

  let communityDiscussions: CommunityDiscussionToDisplay[] = [];
  let pagination: Pagination | undefined = undefined;
  
  if (!communityId) {
    return new NextResponse("Community must have an id", { status: 400 });
  }

  const driver = defineDriver();
  const session = driver.session();

  try {
    let selectResult,  pagingResult, selectQuery;

    let pagingQuery = `SKIP $skip LIMIT $itemsPerPage`;

    if(searchTerm){
      selectQuery = `
          MATCH (community:Community { id: $communityId })-[:DISCUSSION_POSTED]->(communityDiscussion: CommunityDiscussion)
          WHERE communityDiscussion.name CONTAINS $searchTerm
          WITH communityDiscussion
          RETURN communityDiscussion
      `;

      selectResult = await read(
        session,
        `${selectQuery} ${pagingQuery}`,
        {
          communityId,
          searchTerm: searchTerm ?? "",
          skip: int((currentPageParsed - 1) *  itemsPerPageParsed),
          itemsPerPage: int(itemsPerPageParsed)
        },
        ["communityDiscussion"]
    );
      
      pagingResult = await read(
        session,
        commonCountCipher(selectQuery, 'communityDiscussion'),
        {
          communityId,
          searchTerm: searchTerm ?? "",
        },
        'total'
      );
    } else {
      selectQuery = `
          MATCH (community:Community { id: $communityId })-[:DISCUSSION_POSTED]->(communityDiscussion: CommunityDiscussion)
          OPTIONAL MATCH (cmtyDisc)-[:INVITED_TO_DISCUSSION]->(iUsers: User)
          OPTIONAL MATCH (cmtyDisc)-[:JOINED_DISCUSSION]->(jUsers: User)
          WITH communityDiscussion,
              collect(DISTINCT iUsers) as invitedUsers,
              collect(DISTINCT jUsers) as joinedUsers
          RETURN communityDiscussion, invitedUsers, joinedUsers
      `;
      selectResult = await read(
        session,
        `${selectQuery} ${pagingQuery}`,
        {
          communityId,
          skip: int((currentPageParsed - 1) *  itemsPerPageParsed),
          itemsPerPage: int(itemsPerPageParsed)
        },
        ["communityDiscussion", 'invitedUsers', 'joinedUsers']
      );

      pagingResult = await read(
        session,
        commonCountCipher(selectQuery, 'communityDiscussion'),
        {
          communityId
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
    
    communityDiscussions = selectResult ?? []; // Adjust based on your schema
    
  } catch (err) {
    return NextResponse.json({ message: "Fetch community discussions error!", success: false });
  }
  finally {
    await session.close();
  }

  return NextResponse.json({ 
      result: new PaginatedResult<any>(communityDiscussions, pagination!) 
   });
}

async function POST_CREATE_COMMUNITY_DISCUSSION(
  request: NextRequest,
  { params }: { params: { user_id: string, community_id: string } }
) {
  const { values:data }: { values: CreateListOrCommunityFormDto } = await request.json();
  const driver = defineDriver();
  const session = driver.session();
  const { user_id, community_id } = params;
  const userId = user_id as string;
  const communityId = community_id as string;

  console.log('post community data:', data);
  if (!data.name) {
    return new NextResponse("Name of Community Discussion is required", { status: 400 });
  }
  try {
    const communityDiscussionId = `communityDiscussion_${faker.datatype.uuid()}`;

    await write(
      session,
      `
        // Create a new community record 
        MERGE (u:User {id: $userId})
        MERGE (cmty:Community {id: $communityId})
        CREATE (cmtyDisc:CommunityDiscussion {
          id: $id,
          userId: $userId,
          communityId: $communityId,
          name: $name,
          createdAt: datetime(),
          updatedAt: null,
          _rev: "",
          _type: "community_discussion",
          isPrivate: $isPrivate,
          tags: $tags
        })
        CREATE (u)-[:CREATED_DISCUSSION {timestamp: datetime()}]->(cmtyDisc)
        CREATE (cmty)-[:DISCUSSION_POSTED {timestamp: datetime()}]->(cmtyDisc)
        CREATE (cmtyDisc)-[:POSTED_DISCUSSION_ON {timestamp: datetime()}]->(cmty)
        `,
      {
        id: communityDiscussionId,
        userId,
        communityId,
        name: data.name,
        isPrivate: (data.isPrivate === 'private'),
        tags: data.tags
      }
    );

    await write(
      session,
      `
        UNWIND $usersAdded AS usersAddedId
        MATCH (cmtyDisc: CommunityDiscussion {id: $communityDiscussionId}), (cmty: Community {id: $communityId}), (user:User {id: usersAddedId})
        MERGE (cmty)-[cr:INVITED]->(user)
        MERGE (cmtyDisc)-[r:INVITED_TO_DISCUSSION]->(user)
        SET r.createdAt = datetime()
        SET cr.createdAt = datetime()
        RETURN count(r) AS relationshipsCreated
      `,
      {
        communityDiscussionId,
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

export  { 
  GET_COMMUNITY_DISCUSSIONS as GET,
  POST_CREATE_COMMUNITY_DISCUSSION as POST
}