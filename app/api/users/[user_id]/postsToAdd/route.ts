import { extractQryParams } from "@utils/common";
import { commonCountCipher } from "@utils/neo4j";
import { defineDriver, read } from "@utils/neo4j/neo4j";
import { PaginatedResult, Pagination } from "models/common";
import { int } from "neo4j-driver";
import { NextRequest, NextResponse } from "next/server";
import {  PostToDisplay } from "typings";

async function GET(
    request: NextRequest,
    { params }: { params: { user_id: string } }
) {
    const { user_id } = params;
    const userId = user_id as string;

    if (!userId) {
        return new NextResponse("User ID is required", { status: 400 });
    }

    const [currentPage, itemsPerPage, searchTerm] = extractQryParams(request, ['currentPage', 'itemsPerPage', 'searchTerm']);
    const currentPageParsed = parseInt(currentPage!);
    const itemsPerPageParsed = parseInt(itemsPerPage!);

    const driver = defineDriver();
    const session = driver.session();
    let postsToAdd: PostToDisplay[] = [];
    let pagination: Pagination | undefined = undefined;

    try {
        
        const userPostTags = await read(
            session,
            `
                MATCH (post:Post { userId: $userId })
                WITH post
                ORDER BY post.createdAt DESC
                UNWIND post.tags AS tag
                WITH DISTINCT tag
                RETURN collect(tag) AS distinctTags
            `,
            {
                userId
            },
            "distinctTags"
        );

        console.log('userPostTags', JSON.stringify(userPostTags));

        // const user: User = users && users.length ? users[0] : undefined;

        let selectResult, pagingResult, selectQuery;

        let pagingQuery = `SKIP $skip LIMIT $itemsPerPage`;
        if (searchTerm) {
            selectQuery = `
                MATCH (post:Post), (user: User { id: post.userId })
                WHERE post.text CONTAINS $searchTerm 
                        AND (
                            ANY(scholar in post.tags WHERE postTag IN $userPostTags) 
                        )  AND  user.id <> $userId 
                OPTIONAL MATCH (post)-[:HAS_COMMENT]->(c:Comment)<-[:COMMENTED]-(u:User)
                OPTIONAL MATCH (post)-[:RETWEETS]->(reposter:User)
                OPTIONAL MATCH (post)-[:LIKED]->(liker:User)
                WITH post,
                    user.username as username,
                    user.avatar as profileImg,
                    COLLECT(DISTINCT c) AS comments,
                    COLLECT(DISTINCT u) AS commenters,
                    COLLECT(DISTINCT reposter) AS reposters,
                    COLLECT(DISTINCT liker) AS likers
                ORDER BY post.createdAt DESCENDING
                RETURN post,
                      username,
                      profileImg,
                      comments,
                      commenters,
                      reposters,
                      likers
            `;
            selectResult = await read(
                session,
                `${selectQuery} ${pagingQuery}`,
                {
                    searchTerm: searchTerm ?? "",
                    userId,
                    userPostTags,
                    skip: int((currentPageParsed - 1) * itemsPerPageParsed),
                    itemsPerPage: int(itemsPerPageParsed)
                },
                ["post", "username", "profileImg", "comments", "commenters", "reposters", "likers"]
            );
            pagingResult = await read(
                session,
                commonCountCipher(selectQuery, 'post'),
                {
                    searchTerm: searchTerm ?? "",
                    userId,
                    userPostTags,
                },
                'total'
            );
        } else {
            selectQuery = `
                MATCH (post:Post), (user: User { id: post.userId })
                WHERE ANY(scholar in post.tags WHERE postTag IN $userPostTags) AND  user.id <> $userId 
                OPTIONAL MATCH (post)-[:HAS_COMMENT]->(c:Comment)<-[:COMMENTED]-(u:User)
                OPTIONAL MATCH (post)-[:RETWEETS]->(reposter:User)
                OPTIONAL MATCH (post)-[:LIKED]->(liker:User)
                WITH post,
                    user.username as username,
                    user.avatar as profileImg,
                    COLLECT(DISTINCT c) AS comments,
                    COLLECT(DISTINCT u) AS commenters,
                    COLLECT(DISTINCT reposter) AS reposters,
                    COLLECT(DISTINCT liker) AS likers
                ORDER BY post.createdAt DESCENDING
                RETURN post,
                      username,
                      profileImg,
                      comments,
                      commenters,
                      reposters,
                      likers
            `;
            selectResult = await read(
                session,
                `${selectQuery} ${pagingQuery}`,
                {
                    userId,
                    userPostTags,
                    skip: int((currentPageParsed - 1) * itemsPerPageParsed),
                    itemsPerPage: int(itemsPerPageParsed)
                },
                  ["post", "username", "profileImg", "comments", "commenters", "reposters", "likers"]
            );
            pagingResult = await read(
                session,
                commonCountCipher(selectQuery, 'post'),
                {
                    userId,
                    userPostTags,
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
        postsToAdd = selectResult ?? []; // Adjust based on your schema

        return NextResponse.json({
            result: new PaginatedResult<any>(postsToAdd, pagination!)
        });
    } catch (err) {
        return NextResponse.json({ message: "Fetch users to add error!", success: false });
    }
    finally {
        await session.close();
    }


}

export { GET };