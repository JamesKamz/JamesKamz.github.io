import bcrypt from "bcryptjs";
import NextAuth, { CredentialsSignin, type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, hashIp } from "@/lib/request";

declare module "next-auth" {
  interface Session {
    user: { id: string; role: "ADMIN" } & DefaultSession["user"];
  }
  interface User {
    role?: "ADMIN";
  }
}

class TooManyAttempts extends CredentialsSignin {
  code = "rate_limited";
}

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(1).max(200),
});

let dummyHash: string | undefined;

const githubEnabled = Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 }, // 8h admin sessions
  pages: { signIn: "/admin/login", error: "/admin/login" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: { email: { type: "email" }, password: { type: "password" } },
      async authorize(raw, request) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const ip = hashIp(clientIp(request.headers));
        const rl = await rateLimit(`login:${ip}`, 8, 15 * 60_000);
        if (!rl.ok) throw new TooManyAttempts();

        const db = getDb();
        if (!db) return null;
        const user = await db.user.findUnique({ where: { email } });
        // Constant-ish time: always run a bcrypt comparison.
        const hash = user?.passwordHash ?? (dummyHash ??= await bcrypt.hash("not-the-password", 12));
        const valid = await bcrypt.compare(password, hash);
        if (!user || !user.passwordHash || !valid || user.role !== "ADMIN") return null;
        return { id: user.id, email: user.email, name: user.name, role: "ADMIN" };
      },
    }),
    ...(githubEnabled ? [GitHub] : []),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "github") return true;
      // Only the configured GitHub account may sign in.
      const allowed = process.env.ADMIN_GITHUB_LOGIN?.toLowerCase();
      const login = (profile as { login?: string } | undefined)?.login?.toLowerCase();
      return Boolean(allowed && login && login === allowed);
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = "ADMIN";
        token.sub = account?.provider === "github" ? `github:${token.sub}` : user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role === "ADMIN" ? "ADMIN" : (undefined as never);
      }
      return session;
    },
  },
});

export { githubEnabled };
