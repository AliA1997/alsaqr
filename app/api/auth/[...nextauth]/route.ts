// pages/api/auth/[...nextauth].ts
import { faker } from "@faker-js/faker";
import { getEmailUsername } from "@utils/neo4j/index";
import { defineDriver, read, write } from "@utils/neo4j/neo4j";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { ProfileUser } from "typings";

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
const checkUserQuery = `MATCH (user:User {email: $email}) return user`;

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async session({ session, token, user }) {
      const driver = defineDriver();
      const dSession = driver.session();
      let profileUser: ProfileUser | undefined = undefined;
      
      if (session && session.user && session.user.email) {
        const usersInDb = await read(
          dSession,
          sessionQuery,
          {
            email: session.user.email,
          },
          ["user", "bookmarks", "reposts", "likedPosts"]
        );
        const userInDb = usersInDb && usersInDb.length ? usersInDb[0] : {};
        const userBookmarks: string[] = Array.from(new Set(userInDb.bookmarks.map((bk: any) => bk.id)));
        
        session.user = {
          ...session.user,
          ...userInDb.user,
          bookmarks: userBookmarks,
          reposts: Array.from(new Set(userInDb.reposts.map((repost: any) => repost.id))),
          likedPosts: Array.from(new Set(userInDb.likedPosts.map((likedTweet: any) => likedTweet.id))),
        };
        
      }

      return session;
    },
    async signIn({ account, profile }) {
      // console.log("ACCOUNT:", account);
      // console.log("PROFILE:", profile);
      if (!profile?.email) {
        throw new Error("Profile doesn't exist.");
      }

      //Upsert functionality .
      try {
        const driver = defineDriver();
        const dSession = driver.session();
        const user = await read(
          dSession,
          checkUserQuery,
          {
            email: profile.email,
          },
          "user"
        );
        // console.log("Neo4j User:", user);
        if (!user?.length)
          await write(
            dSession,
            `
              CREATE (u:User {
                id: $id,
                createdAt: $createdAt,
                updatedAt: $updatedAt,
                username: $username,
                countryOfOrigin: $countryOfOrigin,
                email: $email,
                phone: $phone,
                bio: $bio,
                bgThumbnail: $bgThumbnail,
                avatar: $avatar,
                dateOfBirth: $dateOfBirth,
                geoId: $geoId,
                maritalStatus: $maritalStatus,
                preferredMadhab: $preferredMadhab,
                hobbies: $hobbies,
                frequentMasjid: $frequentMasjid,
                favoriteQuranReciters: $favoriteQuranReciters,
                favoriteIslamicScholars: $favoriteIslamicScholars,
                islamicStudyTopics: $islamicStudyTopics,
                verified: false,
                isCompleted: false
              })`,
            {
              id: faker.datatype.uuid(),
              createdAt: new Date().toUTCString(),
              updatedAt: null,
              username: getEmailUsername(profile.email),
              email: profile.email,
              bio: '',
              countryOfOrigin: 'United States',
              phone: null,
              avatar: (profile as any)["picture"]
                ? (profile as any)["picture"]
                : null,
              bgThumbnail: faker.image.city(),
              dateOfBirth: null,
              geoId: null,
              maritalStatus: 'Single',
              preferredMadhab: 'Hanafi',
              hobbies: [],
              frequentMasjid: [],
              favoriteQuranReciters: [],
              favoriteIslamicScholars: [],
              islamicStudyTopics: [],
            }
          );
      } catch (error) {
        console.log("Profile Login Error:", error);
      } finally {
        return true;
      }
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
