import { extractQryParams } from "@utils/common";
import { commonCountCipher } from "@utils/neo4j";
import { defineDriver, getUserIdFromSession, read, readNested, write } from "@utils/neo4j/neo4j";
import { PaginatedResult, Pagination } from "models/common";
import { ListItemToDisplay } from "models/list";
import { int, Session } from "neo4j-driver";
import { NextRequest, NextResponse } from "next/server";



async function getListInfo(session: Session, listId: string) {
  const listInfoResponse = await read(
      session,
      `
        MATCH (list:List {id: $listId})
        WITH list
        RETURN list
      `,
      { listId },
      ["list"]
  );

  const { list }: any = listInfoResponse && listInfoResponse.length ? listInfoResponse[0] : undefined;

  return list;
}

async function GET_SAVED_LIST_ITEMS(
  request: NextRequest,
  { params }: { params: { list_id: string } }
) {
  const { list_id } = params;
  const listId = list_id as string;

  const [currentPage, itemsPerPage] = extractQryParams(request, ['currentPage', 'itemsPerPage']);
  const currentPageParsed = parseInt(currentPage!);
  const itemsPerPageParsed = parseInt(itemsPerPage!);

  let savedListItems: ListItemToDisplay[] = [];
  let pagination: Pagination | undefined = undefined;
  
  if (!listId) {
    return new NextResponse("List must have an id", { status: 400 });
  }

  const driver = defineDriver();
  const session = driver.session();
  let listInfo: any | undefined;

  try {
    listInfo = await getListInfo(session, listId);

    let selectResult,  pagingResult, selectQuery;

    let pagingQuery = `SKIP $skip LIMIT $itemsPerPage`;

    selectQuery = `
        MATCH (list { id: $listId })-[r:SAVED_LIST_ITEM]->(listItem:ListItem)
        OPTIONAL MATCH (post: Post { id: listItem.postId })<-[:POSTED]-(postUser: User)
        OPTIONAL MATCH (cmty: Community { id: listItem.communityId })<-[:COMMUNITY_FOUNDER]-(cmtyFounder: User)
        OPTIONAL MATCH (cmtyDisc: CommunityDiscussion { id: listItem.communityDiscussionId })<-[:CREATED_DISCUSSION]-(cmtyDiscUser: User)
        OPTIONAL MATCH (cmtyDiscMsg: CommunityDiscussionMessage { id: listItem.communityDiscussionMessageId })<-[:POST_DISCUSSION_MESSAGE]-(cmtyDiscMsgUser: User)
        OPTIONAL MATCH (user: User { id: listItem.savedUserId })

        WITH 
          listItem, post, postUser, cmty, cmtyFounder, cmtyDisc, cmtyDiscUser, cmtyDiscMsg, cmtyDiscMsgUser, user
          
        RETURN 
          listItem,
          CASE 
            WHEN cmty IS NOT NULL THEN {
              community: cmty,
              founder: cmtyFounder.username,
              founderProfileImg: cmtyFounder.avatar
            }
            WHEN cmtyDisc IS NOT NULL THEN cmtyDisc
            WHEN cmtyDiscMsg IS NOT NULL THEN {
              username: cmtyDiscMsgUser.username,
              profileImg: cmtyDiscMsgUser.avatar,
              communityDiscussionMessage: cmtyDiscMsg
            }
            WHEN user IS NOT NULL THEN {
              user: user
            }
            WHEN post IS NOT NULL THEN {
              post: post,
              username: postUser.username,
              profileImg: postUser.avatar
            }
            ELSE NULL
          END AS relatedEntity,
          CASE 
            WHEN cmty IS NOT NULL THEN "Community"
            WHEN cmtyDisc IS NOT NULL THEN "Community Discussion"
            WHEN cmtyDiscMsg IS NOT NULL THEN "Community Discussion Message"
            WHEN user IS NOT NULL THEN "User"
            WHEN post IS NOT NULL THEN "Post"
            ELSE NULL
          END AS label
    `;
    selectResult = await readNested(
        session,
        `${selectQuery} ${pagingQuery}`,
        {
            listId,
            skip: int((currentPageParsed - 1) *  itemsPerPageParsed),
            itemsPerPage: int(itemsPerPageParsed)
        },
        ["listItem", "relatedEntity", "label"],
        "relatedEntity",
        ["post", "community", "user", "communityDiscussion", "communityDiscussionMessage"]
    );

    pagingResult = await read(
        session,
        commonCountCipher(selectQuery, 'listItem'),
        {
            listId
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
    
    savedListItems = selectResult ?? []; // Adjust based on your schema
    
    console.log('savedListItems:', savedListItems)
  } catch (err) {
    return NextResponse.json({ message: "Fetch saved list items error!", success: false });
  }
  finally {
    await session.close();
  }

  return NextResponse.json({ 
      listInfo,
      result: new PaginatedResult<any>(savedListItems, pagination!) 
   });
}


async function PATCH_SAVE_ITEM_TO_LIST(
  request: NextRequest,
  { params }: { params: { user_id: string, list_id: string } }
) {
  const { values:data }: { values: { relatedEntityId: string, type: string } } = await request.json();
  const { user_id, list_id } = params;
  const listId = list_id as string;
  const userId = user_id as string;

  if (!userId) {
    return new NextResponse("Must be logged in to save items to a list", { status: 400 });
  }
  if (!listId) {
    return new NextResponse("List must have an id", { status: 400 });
  }

  const driver = defineDriver();
  const session = driver.session();
  let success = false;
  try {
    const savingPostToList = (data.type === "post");
    console.log('savingpostTolist:', savingPostToList);
    if(savingPostToList)
      await write(
        session,
        `
        MATCH (list:List {id: $listId, userId: $userId})
        WHERE NOT EXISTS {
          MATCH (list)-[:SAVED_LIST_ITEM]->(existing:ListItem {postId: $postId})
        }
        WITH list
        CREATE (list)-[r:SAVED_LIST_ITEM]->(listItem:ListItem {
          id: apoc.text.format("listItem_%s", [randomUUID()]),
          postId: $postId,
          listId: $listId,
          listItemType: 'post',
          savedAt: datetime(),
          savedUserId: null,
          communityId: null,
          communityDiscussionId: null,
          communityDiscussionMessageId: null
        })
        RETURN CASE WHEN count(r) > 0 THEN 1 ELSE 0 END AS itemCreated
        `,
        {
          userId,
          postId: data.relatedEntityId,
          listId,
        }
      );
    else
      await write(
        session,
        `
          MATCH (list: List {id: $listId, userId: $userId})
          WHERE NOT EXISTS {
            MATCH (list)-[:SAVED_LIST_ITEM]->(existingItem:ListItem {listId: $listId, savedUserId: $savedUserId})
          }
          WITH list
          CREATE (list)-[r:SAVED_LIST_ITEM]->(listItem:ListItem {
            id: apoc.text.format("listItem_%s", [randomUUID()]),
            savedUserId: $savedUserId,
            postId: null,
            communityId: null,
            communityDiscussionId: null,
            communityDiscussionMessageId: null,
            listId: $listId,
            listItemType: 'user',
            savedAt: datetime()
          })
          RETURN count(r) AS relationshipsCreated
        `,
        {
          userId,
          savedUserId: data.relatedEntityId,
          listId,
        }
      );

      success = true;
  } catch (err) {
    return NextResponse.json({ message: "Save new list item error!", success: false });
  }
  finally {
    await session.close();
    return NextResponse.json({ 
      success
    });
  }
}

async function DELETE_LIST(
  request: NextRequest,
  { params }: { params: { user_id: string, list_id: string } }
) {
  const { user_id, list_id } = params;
  const listId = list_id as string;
  const userId = user_id as string;
  
  if (!listId) {
    return new NextResponse("List must have an id", { status: 400 });
  }

  const driver = defineDriver();
  const session = driver.session();
  let success = false;
  try {
    const userAuthSessionId = await getUserIdFromSession(session);
    if (!userAuthSessionId) {
        return new NextResponse("Only logged in user can delete lists", { status: 400 });   
    }


    await write(
      session,
      `
      MATCH (listItem: ListItem { listItem: $listId })
      DETACH DELETE listItem;
    `,
      {
        listId,
        userId: userAuthSessionId
      }
    );

    await write(
      session,
      `
      MATCH (list: List { id: $listId })
      WHERE list.userId = $userId
      DETACH DELETE list;
    `,
      {
        listId,
        userId: userAuthSessionId
      }
    );

    success = true;
  } catch (err) {
    console.log("Error:", err);
    return NextResponse.json({ message: "Fetch saved list items error!", success: false });
  }
  finally {
    await session.close();
  }
  return NextResponse.json({  success });
}



export {
  DELETE_LIST as DELETE,
  PATCH_SAVE_ITEM_TO_LIST as PATCH,
  GET_SAVED_LIST_ITEMS as GET
}