import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-semibold">Landing page</h1>
      <div className="flex gap-4">
        <Link
          href="/authenticate"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Log in
        </Link>
        <button
          type="button"
          className="rounded-md border border-foreground px-4 py-2 text-sm font-medium"
        >
          Log out
        </button>
      </div>
    </main>
  );
}
