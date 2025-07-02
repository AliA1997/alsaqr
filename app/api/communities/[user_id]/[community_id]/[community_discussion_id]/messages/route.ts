import { faker } from "@faker-js/faker";
import { extractQryParams } from "@utils/common";
import { commonCountCipher } from "@utils/neo4j";
import { defineDriver, read, write } from "@utils/neo4j/neo4j";
import { PaginatedResult, Pagination } from "models/common";
import {  CommunityDiscussionMessage, CommunityDiscussionMessageDto, CommunityDiscussionMessageToDisplay } from "models/community";
import { int } from "neo4j-driver";
import { NextRequest, NextResponse } from "next/server";


async function GET_COMMUNITY_DISCUSSION_MESSAGES(
  request: NextRequest,
  { params }: { params: { community_discussion_id: string } }
) {
  const { community_discussion_id } = params;
  const communityDiscussionId = community_discussion_id as string;

  const [currentPage, itemsPerPage, searchTerm] = extractQryParams(request, ['currentPage', 'itemsPerPage', 'searchTerm']);
  const currentPageParsed = parseInt(currentPage!);
  const itemsPerPageParsed = parseInt(itemsPerPage!);

  let communityDiscussionMessages: CommunityDiscussionMessageToDisplay[] = [];
  let pagination: Pagination | undefined = undefined;
  
  if (!communityDiscussionId) {
    return new NextResponse("Community Discussion must have an id", { status: 400 });
  }

  const driver = defineDriver();
  const session = driver.session();

  try {
    let selectResult,  pagingResult, selectQuery;

    let pagingQuery = `SKIP $skip LIMIT $itemsPerPage`;

    if(searchTerm){
      selectQuery = `
          MATCH (cd: CommunityDiscussion { id: $communityDiscussionId })-[:DISCUSSION_MESSAGE_POSTED]->(communityDiscussionMessage: CommunityDiscussionMessage)
          (user: User {id: communityDiscussionMessage.userId})
          WHERE communityDiscussionMessage.messageText CONTAINS $searchTerm
          WITH 
            user.username as username,
            user.profileImg as profileImg,
            communityDiscussionMessage
          RETURN communityDiscussionMessage, username, profileImg
      `;

      selectResult = await read(
        session,
        `${selectQuery} ${pagingQuery}`,
        {
          communityDiscussionId,
          searchTerm: searchTerm ?? "",
          skip: int((currentPageParsed - 1) *  itemsPerPageParsed),
          itemsPerPage: int(itemsPerPageParsed)
        },
        ["communityDiscussionMessage"]
    );
      
      pagingResult = await read(
        session,
        commonCountCipher(selectQuery, 'communityDiscussionMessage'),
        {
          communityDiscussionId,
          searchTerm: searchTerm ?? "",
        },
        'total'
      );
    } else {
      selectQuery = `
          MATCH (cd: CommunityDiscussion { id: $communityDiscussionId })-[:DISCUSSION_MESSAGE_POSTED]->(communityDiscussionMessage: CommunityDiscussionMessage),
          (user: User {id: communityDiscussionMessage.userId})
          WITH
           user.username as username,
           user.profileImg as profileImg,
           communityDiscussionMessage
          RETURN communityDiscussionMessage, username, profileImg
      `;
      selectResult = await read(
        session,
        `${selectQuery} ${pagingQuery}`,
        {
          communityDiscussionId,
          skip: int((currentPageParsed - 1) *  itemsPerPageParsed),
          itemsPerPage: int(itemsPerPageParsed)
        },
        ["communityDiscussionMessage"]
      );

      pagingResult = await read(
        session,
        commonCountCipher(selectQuery, 'communityDiscussionMessage'),
        {
          communityDiscussionId
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
    
    communityDiscussionMessages = selectResult ?? []; // Adjust based on your schema
    
  } catch (err) {
    return NextResponse.json({ message: "Fetch community discussion messages error!", success: false });
  }
  finally {
    await session.close();
  }

  return NextResponse.json({ 
      result: new PaginatedResult<any>(communityDiscussionMessages, pagination!) 
   });
}



async function POST_CREATE_COMMUNITY_DISCUSSION_MSG(
  request: NextRequest,
  { params }: { params: { user_id: string, community_id: string, community_discussion_id: string } }
) {
  const { values:data }: { values: CommunityDiscussionMessageDto } = await request.json();
  const driver = defineDriver();
  const session = driver.session();
  const { user_id, community_id, community_discussion_id } = params;
  const userId = user_id as string;
  const communityId = community_id as string;
  const communityDiscussionId = community_discussion_id as string;

  console.log('post community discussion message data:', data);
  if (!data.messageText) {
    return new NextResponse("Message text is required to create discussion message", { status: 400 });
  }
  try {
    const communityDiscussioMessageId = `communityDiscussionMsg_${faker.datatype.uuid()}`;

    await write(
      session,
      `
        // Create a new community record 
        MERGE (u:User {id: $userId})
        MERGE (cmty:Community {id: $communityId})
        MERGE (cmtyDisc:CommunityDiscussion {id: $communityDiscussionId})
        CREATE (cmtyDiscMsg:CommunityDiscussionMessage {
          id: $id,
          userId: $userId,
          communityId: $communityId,
          communityDiscussionId: $communityDiscussionId,
          messageText: $messageText,
          image: $image,
          updatedAt: null,
          _rev: "",
          _type: "community_discussion",
          tags: $tags
        })
        CREATE (u)-[:POST_DISCUSSION_MESSAGE {timestamp: datetime()}]->(cmtyDiscMsg)
        CREATE (cmtyDisc)-[:DISCUSSION_MESSAGE_POSTED {timestamp: datetime()}]->(cmtyDiscMsg)
        CREATE (cmtyDiscMsg)-[:DISCUSSION_MESSAGED_ON {timestamp: datetime()}]->(cmtyDisc)
        `,
      {
        id: communityDiscussioMessageId,
        userId,
        communityId,
        communityDiscussionId,
        messageText: data.messageText,
        image: data.image,
        tags: data.tags
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "Add community error!", success: false });
  } finally {
    await session.close();
  }
}

export {
  GET_COMMUNITY_DISCUSSION_MESSAGES as GET,
  POST_CREATE_COMMUNITY_DISCUSSION_MSG as POST
};