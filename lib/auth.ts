import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { db } from "@/lib/db";
import { sanitizeLine } from "@/lib/sanitize";

const MAX_NAME_LENGTH = 100;

export const auth = betterAuth({
  database: db,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({ data: { ...user, name: cleanUserName(user.name) } }),
      },
      update: {
        before: async (user) =>
          user.name === undefined ? { data: user } : { data: { ...user, name: cleanUserName(user.name) } },
      },
    },
  },
  plugins: [nextCookies()],
});

function cleanUserName(name: unknown): string {
  const cleaned = typeof name === "string" ? sanitizeLine(name) : "";
  if (cleaned.length < 1 || cleaned.length > MAX_NAME_LENGTH) {
    throw new APIError("BAD_REQUEST", {
      message: `Name must be between 1 and ${MAX_NAME_LENGTH} characters`,
    });
  }
  return cleaned;
}

export type User = typeof auth.$Infer.Session.user;

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/authenticate");
  }
  return user;
}
