import { extractQryParams } from "@utils/common";
import { commonCountCipher } from "@utils/neo4j";
import { defineDriver, read } from "@utils/neo4j/neo4j";
import { PaginatedResult, Pagination } from "models/common";
import { int } from "neo4j-driver";
import { NextRequest, NextResponse } from "next/server";
import {  User, UserItemToDisplay } from "typings";

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
    let usersToAdd: UserItemToDisplay[] = [];
    let pagination: Pagination | undefined = undefined;

    try {
        
        const users = await read(
            session,
            `MATCH (user: User {id: $userId}) RETURN user`,
            {
                userId
            },
            "user"
        );

        const user: User = users && users.length ? users[0] : undefined;

        let selectResult, pagingResult, selectQuery;

        let pagingQuery = `SKIP $skip LIMIT $itemsPerPage`;
        if (searchTerm) {
            selectQuery = `
                MATCH (user:User)
                WHERE (user.username CONTAINS $searchTerm OR user.email CONTAINS $searchTerm) 
                        AND (
                            ANY(scholar in user.favoriteIslamicScholars WHERE scholar IN $favoriteIslamicScholars) 
                            OR 
                            ANY(hobby in user.hobbies WHERE hobby IN $hobbies)
                            OR
                            ANY(quranReciter in user.favoriteQuranReciters WHERE quranReciter IN $favoriteQuranReciters)
                            OR
                            ANY(islamicStudyTopic in user.islamicStudyTopics WHERE islamicStudyTopic IN $islamicStudyTopics)
                            OR
                            user.preferredMadhab = $preferredMadhab
                        )  AND  user.id <> $userId 
                    OPTIONAL MATCH (follower:User)-[:FOLLOWED]->(user)
                    OPTIONAL MATCH (user)-[:FOLLOW_USER]->(following:User)
                    RETURN user,
                            COLLECT(DISTINCT follower) AS followers,
                            COLLECT(DISTINCT following) AS following
            `;
            selectResult = await read(
                session,
                `${selectQuery} ${pagingQuery}`,
                {
                    searchTerm: searchTerm ?? "",
                    userId,
                    favoriteIslamicScholars: user.favoriteIslamicScholars ?? [],
                    hobbies: user.hobbies ?? [],
                    favoriteQuranReciters: user.favoriteQuranReciters ?? [],
                    islamicStudyTopics: user.islamicStudyTopics ?? [],
                    preferredMadhab: user.preferredMadhab ?? "",
                    skip: int((currentPageParsed - 1) * itemsPerPageParsed),
                    itemsPerPage: int(itemsPerPageParsed)
                },
                ["user", "followers", "following"]
            );
            pagingResult = await read(
                session,
                commonCountCipher(selectQuery, 'user'),
                {
                    searchTerm: searchTerm ?? "",
                    userId,
                    favoriteIslamicScholars: user.favoriteIslamicScholars ?? [],
                    hobbies: user.hobbies ?? [],
                    favoriteQuranReciters: user.favoriteQuranReciters ?? [],
                    islamicStudyTopics: user.islamicStudyTopics ?? [],
                    preferredMadhab: user.preferredMadhab ?? "",
                },
                'total'
            );
        } else {
            selectQuery = `
                MATCH (user:User)
                    WHERE 
                        (
                            ANY(scholar in user.favoriteIslamicScholars WHERE scholar IN $favoriteIslamicScholars) OR 
                            ANY(hobby in user.hobbies WHERE hobby IN $hobbies) OR
                            ANY(quranReciter in user.favoriteQuranReciters WHERE quranReciter IN $favoriteQuranReciters) OR
                            ANY(islamicStudyTopic in user.islamicStudyTopics WHERE islamicStudyTopic IN $islamicStudyTopics) OR
                            user.preferredMadhab = $preferredMadhab
                        ) AND  user.id <> $userId 
                    OPTIONAL MATCH (follower:User)-[:FOLLOWED]->(user)
                    OPTIONAL MATCH (user)-[:FOLLOW_USER]->(following:User)
                    RETURN user,
                            COLLECT(DISTINCT follower) AS followers,
                            COLLECT(DISTINCT following) AS following
            `;
            selectResult = await read(
                session,
                `${selectQuery} ${pagingQuery}`,
                {
                    userId,
                    favoriteIslamicScholars: user.favoriteIslamicScholars ?? [],
                    hobbies: user.hobbies ?? [],
                    favoriteQuranReciters: user.favoriteQuranReciters ?? [],
                    islamicStudyTopics: user.islamicStudyTopics ?? [],
                    preferredMadhab: user.preferredMadhab ?? '',
                    skip: int((currentPageParsed - 1) * itemsPerPageParsed),
                    itemsPerPage: int(itemsPerPageParsed)
                },
                ["user", "followers", "following"]
            );
            pagingResult = await read(
                session,
                commonCountCipher(selectQuery, 'user'),
                {
                    userId,
                    favoriteIslamicScholars: user.favoriteIslamicScholars ?? [],
                    hobbies: user.hobbies ?? [],
                    favoriteQuranReciters: user.favoriteQuranReciters ?? [],
                    islamicStudyTopics: user.islamicStudyTopics ?? [],
                    preferredMadhab: user.preferredMadhab ?? ''
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
        usersToAdd = selectResult ?? []; // Adjust based on your schema

        return NextResponse.json({
            result: new PaginatedResult<any>(usersToAdd, pagination!)
        });
    } catch (err) {
        return NextResponse.json({ message: "Fetch users to add error!", success: false });
    }
    finally {
        await session.close();
    }


}

export { GET };