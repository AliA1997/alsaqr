// app/api/tweets/[tweet_id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { defineDriver, read } from "@utils/neo4j/neo4j";
import { extractQryParams } from "@utils/common";

async function GET(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const [currentPage, itemsPerPage] = extractQryParams(request, ['currentPage', 'itemsPerPage']);
  const currentPageParsed = parseInt(currentPage ?? '1');
  const itemsPerPageParsed = parseInt(itemsPerPage ?? '10');
  const { user_id } = params;
  const userId = user_id as string;

  if (!userId) {
    return new NextResponse("User ID is required", { status: 400 });
  }

  const driver = defineDriver();
  const session = driver.session();

  try {
    // Adjust the Cypher query to fetch the tweet by ID
    const allPosts = await read(
      session,
      `
        // User Tweets
        MATCH (u:User {id: $userId})
        MATCH (post:Post {userId: u.id})
        OPTIONAL MATCH (post)-[:HAS_COMMENT]->(c:Comment)<-[:COMMENTED]-(u:User)
        OPTIONAL MATCH (post)-[:RETWEETS]->(reposter:User)
        OPTIONAL MATCH (post)-[:LIKED]->(liker:User)
        WITH post, u.username as username, u.avatar as profileImg, COLLECT(DISTINCT c) AS comments, COLLECT(DISTINCT u) AS commenters, COLLECT(DISTINCT reposter) AS reposters, COLLECT(DISTINCT liker) AS likers, "user" as type
        ORDER BY post.createdAt DESCENDING
        RETURN post, username, profileImg, comments, commenters, reposters, likers, type
        SKIP ${(currentPageParsed - 1) * itemsPerPageParsed}
        LIMIT ${itemsPerPage}

        UNION

        // Bookmarked Tweets
        MATCH (u:User {id: $userId})
        MATCH (post:Post), (postUser: User { id: post.userId })
        WHERE (u)-[:BOOKMARKED]->(post)
        OPTIONAL MATCH (post)-[:HAS_COMMENT]->(c:Comment)<-[:COMMENTED]-(u:User)
        OPTIONAL MATCH (post)-[:RETWEETS]->(reposter:User)
        OPTIONAL MATCH (post)-[:LIKED]->(liker:User)
        WITH post, postUser.username as username, postUser.avatar as profileImg, COLLECT(DISTINCT c) AS comments, COLLECT(DISTINCT u) AS commenters, COLLECT(DISTINCT reposter) AS reposters, COLLECT(DISTINCT liker) AS likers, "bookmarked" as type
        ORDER BY post.createdAt DESCENDING
        RETURN post, username, profileImg, comments, commenters, reposters, likers, type
        SKIP ${(currentPageParsed - 1) * itemsPerPageParsed}
        LIMIT ${itemsPerPage}

        UNION

        // Liked Tweets
        MATCH (u:User {id: $userId})
        MATCH (post:Post), (postUser: User { id: post.userId })
        WHERE (u)-[:LIKES]->(post)
        OPTIONAL MATCH (post)-[:HAS_COMMENT]->(c:Comment)<-[:COMMENTED]-(u:User)
        OPTIONAL MATCH (post)-[:RETWEETS]->(reposter:User)
        OPTIONAL MATCH (post)-[:LIKED]->(liker:User)
        WITH post, postUser.username as username, postUser.avatar as profileImg, COLLECT(DISTINCT c) AS comments, COLLECT(DISTINCT u) AS commenters, COLLECT(DISTINCT reposter) AS reposters, COLLECT(DISTINCT liker) AS likers, "liked" as type
        ORDER BY post.createdAt DESCENDING
        RETURN post, username, profileImg, comments, commenters, reposters, likers, type
        SKIP ${(currentPageParsed - 1) * itemsPerPageParsed}
        LIMIT ${itemsPerPage}

        UNION

        // Reposted Posts
        MATCH (u:User {id: $userId})
        MATCH (post:Post), (postUser: User { id: post.userId })
        WHERE (u)-[:REPOSTED]->(post)
        OPTIONAL MATCH (post)-[:HAS_COMMENT]->(c:Comment)<-[:COMMENTED]-(u:User)
        OPTIONAL MATCH (post)-[:RETWEETS]->(reposter:User)
        OPTIONAL MATCH (post)-[:LIKED]->(liker:User)
        WITH post, postUser.username as username, postUser.avatar as profileImg, COLLECT(DISTINCT c) AS comments, COLLECT(DISTINCT u) AS commenters, COLLECT(DISTINCT reposter) AS reposters, COLLECT(DISTINCT liker) AS likers, "reposted" as type
        ORDER BY post.createdAt DESCENDING
        RETURN post, username, profileImg, comments, commenters, reposters, likers, type
        SKIP ${(currentPageParsed - 1) * itemsPerPageParsed}
        LIMIT ${itemsPerPage}

        UNION

        // Replied Tweets
        MATCH (u:User {id: $userId})
        MATCH (post:Post), (postUser: User { id: post.userId })
        WHERE (u)-[:COMMENTED]->(post)
        OPTIONAL MATCH (post)-[:HAS_COMMENT]->(c:Comment)<-[:COMMENTED]-(u:User)
        OPTIONAL MATCH (post)-[:RETWEETS]->(reposter:User)
        OPTIONAL MATCH (post)-[:LIKED]->(liker:User)
        WITH post, postUser.username as username, postUser.avatar as profileImg, COLLECT(DISTINCT c) AS comments, COLLECT(DISTINCT u) AS commenters, COLLECT(DISTINCT reposter) AS reposters, COLLECT(DISTINCT liker) AS likers, "replied" as type
        ORDER BY post.createdAt DESCENDING
        RETURN post, username, profileImg, comments, commenters, reposters, likers, type
        SKIP ${(currentPageParsed - 1) * itemsPerPageParsed}
        LIMIT ${itemsPerPage}
      `,
      { userId },
      ["post", "username", "profileImg", "comments", "commenters", "reposters", "likers", "type"]
    );

    const userPosts = allPosts?.filter((p) => p.type === "user");
    const bookmarkedPosts = allPosts?.filter((p) => p.type === "bookmarked");

    const likedPosts = allPosts?.filter((p) => p.type === "liked");
    const repostedPosts = allPosts?.filter((p) => p.type === "reposted");
    const repliedPosts = allPosts?.filter((p) => p.type === "replied");

    // const allTweets = userTweets?.flatMap(tw => tw);
    // console.log("allTweets:", allTweets
    // );
    // console.log("userTweets:", JSON.stringify(userTweets));

    return NextResponse.json({
      profilePosts: {
        userPosts,
        bookmarkedPosts,
        likedPosts,
        repostedPosts,
        repliedPosts,
      },
      success: true,
    });
  } catch (err) {
    return NextResponse.json({ message: "Fetch tweets error", success: false });
  }
}

export { GET };
