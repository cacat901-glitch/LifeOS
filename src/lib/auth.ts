import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { sendWelcomeEmail } from "./email";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  trustHost: true,
  // Support both the NextAuth v4 (NEXTAUTH_SECRET) and v5 (AUTH_SECRET) names.
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // In Auth.js v5, return null for invalid credentials (clean
        // CredentialsSignin error + friendly UI message). Throwing here
        // produces a CallbackRouteError and noisy server logs.
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({ where: { email: credentials.email as string } });
        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(credentials.password as string, user.password);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  events: {
    // When a new user signs up (OAuth or credentials), ensure they have settings + subscription
    async createUser({ user }) {
      const userId = user.id!;

      // Create settings if missing
      const existing = await prisma.userSettings.findUnique({ where: { userId } });
      if (!existing) {
        await prisma.userSettings.create({ data: { userId } });
      }

      // Create free subscription if missing
      const sub = await prisma.subscription.findUnique({ where: { userId } });
      if (!sub) {
        await prisma.subscription.create({ data: { userId, plan: "FREE", status: "ACTIVE" } });
      }

      // Send welcome email for OAuth signups (non-blocking)
      if (user.email) {
        sendWelcomeEmail(user.email, user.name || "").catch(console.error);
      }
    },
  },
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email!;
        session.user.image = token.picture;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
  },
});
