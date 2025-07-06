import { defineDriver, getUserIdFromSession, write } from "@utils/neo4j/neo4j";
import { NextRequest, NextResponse } from "next/server";

async function DELETE_SAVED_LIST_ITEM(
    request: NextRequest,
    { params }: { params: { user_id: string, list_id: string, list_item_id: string } }
) {
    const { user_id, list_id, list_item_id } = params;
    const userId = user_id as string;
    const listId = list_id as string;
    const listItemId = list_item_id as string;

    const driver = defineDriver();
    const session = driver.session();

    try {
        const sessionUserId = await getUserIdFromSession(session);

        if(userId !== sessionUserId)
            throw new Error("Only logged in users can delete lists.");

        await write(
            session,
            `
                MATCH (listItem: ListItem { id: $listItemId, listId: $listId })
                DETACH DELETE listItem
            `,
            { listItemId, listId }
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ message: "Delete User error!", success: false });

    }
}

export { 
    DELETE_SAVED_LIST_ITEM as DELETE
};