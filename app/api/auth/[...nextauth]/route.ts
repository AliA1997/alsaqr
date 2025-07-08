// pages/api/auth/[...nextauth].ts
import { authOptions } from "app/api/utils/authOptions";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
