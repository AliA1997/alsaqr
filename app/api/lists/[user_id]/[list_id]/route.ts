import { extractQryParams } from "@utils/common";
import { commonCountCipher } from "@utils/neo4j";
import { defineDriver, read } from "@utils/neo4j/neo4j";
import { PaginatedResult, Pagination } from "models/common";
import { ListItemToDisplay } from "models/list";
import { int } from "neo4j-driver";
import { NextRequest, NextResponse } from "next/server";


async function GET(
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
        MATCH (list: List { id: $listId })-[:DISCUSSION_MESSAGE_POSTED]->(listItem: ListItem)
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
