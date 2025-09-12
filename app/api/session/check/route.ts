import { extractQryParams } from "@utils/common";
import { defineDriver, read } from "@utils/neo4j/neo4j";
import { NextRequest, NextResponse } from "next/server";


async function POST(request: NextRequest) {    
    const sessionQuery = `
        MATCH (user:User {email: $email})
        OPTIONAL MATCH (user)-[:BOOKMARKED]->(bookmark:Post)
        OPTIONAL MATCH (user)-[:REPOSTED]->(repost:Post)
        OPTIONAL MATCH (user)-[:LIKES]->(likedPost:Post)
        OPTIONAL MATCH (user)-[:COMMENTED]->(repliedPost: Post)
        RETURN user,
            COLLECT(bookmark) AS bookmarks,
            COLLECT(repost) AS reposts,
            COLLECT(likedPost) AS likedPosts,
            COLLECT(repliedPost) as repliedPosts
    `;
    const { values: data }: { values: { email: string } } = await request.json();
    if (!data.email)
        throw new Error("Must pass a email to check, if user's exists");
    let sessionUser = null;

    const driver = defineDriver();
    const session = driver.session();

    try {

        const usersInDb = await read(
            session,
            sessionQuery,
            {
                email: data.email,
            },
            ["user", "bookmarks", "reposts", "likedPosts"]
        );
        const userInDb = usersInDb && usersInDb.length ? usersInDb[0] : {};
        const userBookmarks: string[] = Array.from(new Set(userInDb.bookmarks.map((bk: any) => bk.id)));

        sessionUser = {
            ...userInDb.user,
            bookmarks: userBookmarks,
            reposts: Array.from(new Set(userInDb.reposts.map((repost: any) => repost.id))),
            likedPosts: Array.from(new Set(userInDb.likedPosts.map((likedTweet: any) => likedTweet.id))),
        };
    } catch (err) {

    } finally {
        await session.close();
    }

    return NextResponse.json({
        result: sessionUser
    });
}

export { POST };