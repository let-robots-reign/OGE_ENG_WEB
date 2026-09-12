import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import {
  type DefaultSession,
  type NextAuthConfig,
  customFetch,
} from "next-auth";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import YandexProvider from "next-auth/providers/yandex";
import VkProvider from "next-auth/providers/vk";
import { cookies } from "next/headers";

import { db } from "@/server/db";
import {
  accounts,
  type roleEnum,
  sessions,
  users,
  verificationTokens,
} from "@/server/db/schema";
import { OAUTH_SIGNUP_ROLE_COOKIE } from "@/shared/oauth-signup-role";

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
      role: (typeof roleEnum.enumValues)[number] | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: (typeof roleEnum.enumValues)[number] | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: (typeof roleEnum.enumValues)[number] | null;
  }
}

interface VkIdProfile {
  user_id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar?: string;
  photo?: string;
}

const adapter = DrizzleAdapter(db, {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
}) as NonNullable<NextAuthConfig["adapter"]>;

// Role picked on the signup page. OAuth from the sign-in page carries none:
// the user is created without a role and RoleGate asks for it after login.
// Never trust the cookie with anything above teacher.
const getOAuthSignupRole = async () => {
  const cookieStore = await cookies();
  const value = cookieStore.get(OAUTH_SIGNUP_ROLE_COOKIE)?.value;
  return value === "student" || value === "teacher" ? value : null;
};

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials.email || !credentials.password) {
          return null;
        }

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        });

        if (
          !user?.hashedPassword ||
          !bcrypt.compareSync(
            credentials.password as string,
            user.hashedPassword,
          )
        ) {
          return null;
        }

        return user;
      },
    }),
    YandexProvider({
      clientId: process.env.YANDEX_CLIENT_ID,
      clientSecret: process.env.YANDEX_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    VkProvider({
      clientId: process.env.VK_CLIENT_ID,
      clientSecret: process.env.VK_CLIENT_SECRET,
      // VK ID (id.vk.ru) does not round-trip Auth.js's long encoded `state`
      // verbatim, so the state check fails with
      // `unexpected "state" response parameter value`. PKCE is mandatory for
      // VK ID and provides the CSRF protection state would (it binds the auth
      // code to the code_verifier in our httpOnly cookie), so we rely on it.
      checks: ["pkce"],
      authorization: {
        url: "https://id.vk.ru/authorize",
        params: { scope: "email", response_type: "code" },
      },
      token: {
        url: "https://id.vk.ru/oauth2/auth",
        conform: async (response: Response) => {
          const data = (await response.json()) as Record<string, unknown>;
          // VK ID returns a non-standard id_token (`iis`/`app` instead of
          // `iss`/`aud`, and no `aud` claim), which fails Auth.js's OIDC
          // id_token validation ("aud claim missing"). We resolve the profile
          // via the userinfo request instead, so drop the id_token entirely so
          // Auth.js treats this as a plain OAuth2 flow.
          delete data.id_token;
          return new Response(
            JSON.stringify({
              ...data,
              token_type: (data.token_type as string | undefined) ?? "bearer",
            }),
            { headers: response.headers },
          );
        },
      },
      userinfo: {
        url: "https://id.vk.ru/oauth2/user_info",
        async request({ tokens }: { tokens: { access_token?: string } }) {
          if (!tokens.access_token) {
            throw new Error("Missing access token for VK userinfo request");
          }
          const res = await fetch("https://id.vk.ru/oauth2/user_info", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_id: process.env.VK_CLIENT_ID!,
              access_token: tokens.access_token,
            }),
          });
          const data = (await res.json()) as {
            user?: VkIdProfile;
          } & VkIdProfile;
          return data.user ?? data;
        },
      },
      profile(profile: VkIdProfile) {
        return {
          id: profile.user_id.toString(),
          name: [profile.first_name, profile.last_name]
            .filter(Boolean)
            .join(" "),
          email: profile.email ?? `${profile.user_id}@vk.com`,
          image: profile.avatar ?? profile.photo ?? null,
          role: null,
        };
      },
      [customFetch]: async (url, options) => {
        if (
          url === "https://id.vk.ru/oauth2/auth" &&
          options?.body instanceof URLSearchParams
        ) {
          const cookieStore = await cookies();
          const deviceId = cookieStore.get("vk_device_id")?.value;
          if (deviceId) {
            options.body.set("device_id", deviceId);
          }
        }
        return fetch(url, options);
      },
      allowDangerousEmailAccountLinking: true,
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
  adapter: {
    ...adapter,
    // Only OAuth sign-ups go through the adapter (credentials users are
    // inserted by the signup action), and provider profiles carry no role.
    createUser: async (user) =>
      adapter.createUser!({
        ...user,
        role: user.role ?? (await getOAuthSignupRole()),
      }),
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // On initial sign in, user object is available
        token.role = user.role;
      } else if (token.sub) {
        // On subsequent calls, fetch user from DB to keep role updated
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, token.sub),
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub!,
        role: token.role,
      },
    }),
  },
} satisfies NextAuthConfig;
