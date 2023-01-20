import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async session({ session, token, user }) {
      session.jwt = token.jwt;
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },

    async jwt({ token, user, account }) {
      const isSignIn = user ? true : false;
      if (isSignIn) {
        try{
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/auth/${account?.provider}/callback?access_token=${account?.access_token}`
            );
            const data = await response.json();
            token.jwt = data.jwt;
            token.id = data.user.id;
            const kek = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/users/me?populate=role`,
              { headers: new Headers({ Authorization: `Bearer ${data.jwt}` }) }
            );
            const userInfo = await kek.json();
            token.role = userInfo?.role?.name || "Unauth"
        } catch (error) {console.error(error)}
      }
      return token;
    },
  },
  session: {
    jwt: true,
    maxAge: 30 * 24 * 60 * 60, // the session will last 30 days
  },
};

export default NextAuth(authOptions);
