import Link from "next/link";
import { requireUser } from "@/lib/auth";
import Header from "../_components/header";

export default async function DashboardPage() {
  const user = await requireUser();
  return (
    <div className="min-h-screen">
      <Header user={user} />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Your notes</h1>
          <Link
            href="/notes/new"
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            New Note
          </Link>
        </div>
      </main>
    </div>
  );
}
