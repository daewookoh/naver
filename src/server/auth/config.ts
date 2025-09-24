import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import NaverProvider from "next-auth/providers/naver";

import { env } from "~/env";
import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    DiscordProvider,
    NaverProvider({
      clientId: env.NAVER_CLIENT_ID,
      clientSecret: env.NAVER_CLIENT_SECRET,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  events: {
    signOut: async (message) => {
      // message는 { session: AdapterSession | null } 또는 { token: JWT | null } 형태
      const userId =
        "session" in message ? message.session?.userId : message.token?.sub;
      if (userId) {
        try {
          // 해당 유저의 Account와 Session 데이터를 병렬로 삭제
          await Promise.all([
            db.account.deleteMany({
              where: { userId: userId },
            }),
            db.session.deleteMany({
              where: { userId: userId },
            }),
          ]);

          console.log(
            `User ${userId} logout: Account and Session data deleted successfully`,
          );
        } catch (error) {
          console.error("Error deleting user data on logout:", error);
          // 에러가 발생해도 로그아웃은 계속 진행되도록 함
        }
      }
    },
  },
} satisfies NextAuthConfig;
