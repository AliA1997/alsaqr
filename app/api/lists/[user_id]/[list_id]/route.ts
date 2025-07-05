import { extractQryParams } from "@utils/common";
import { commonCountCipher } from "@utils/neo4j";
import { defineDriver, read, write } from "@utils/neo4j/neo4j";
import { PaginatedResult, Pagination } from "models/common";
import { ListItemToDisplay } from "models/list";
import { int } from "neo4j-driver";
import { NextRequest, NextResponse } from "next/server";


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

  try {
    let selectResult,  pagingResult, selectQuery;

    let pagingQuery = `SKIP $skip LIMIT $itemsPerPage`;

    selectQuery = `
        MATCH (list { id: $listId })-[r:SAVED_LIST_ITEM]->(listItem:ListItem)
        WITH listItem
        RETURN listItem
    `;
    selectResult = await read(
        session,
        `${selectQuery} ${pagingQuery}`,
        {
            listId,
            skip: int((currentPageParsed - 1) *  itemsPerPageParsed),
            itemsPerPage: int(itemsPerPageParsed)
        },
        ["listItem"]
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
    
  } catch (err) {
    return NextResponse.json({ message: "Fetch saved list items error!", success: false });
  }
  finally {
    await session.close();
  }

  return NextResponse.json({ 
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
          WITR list
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
  { params }: { params: { list_id: string } }
) {
  const { list_id } = params;
  const listId = list_id as string;

  
  if (!listId) {
    return new NextResponse("List must have an id", { status: 400 });
  }

  const driver = defineDriver();
  const session = driver.session();

  try {
    
    
  } catch (err) {
    return NextResponse.json({ message: "Fetch saved list items error!", success: false });
  }
  finally {
    await session.close();
    return NextResponse.json({ 
      success: true
    });
  }
}

export {
  PATCH_SAVE_ITEM_TO_LIST as PATCH,
  GET_SAVED_LIST_ITEMS as GET
}