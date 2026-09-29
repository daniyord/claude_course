import Link from "next/link";
import AuthForm from "./_components/auth-form";

type AuthenticatePageProps = {
  searchParams: Promise<{ mode?: string }>;
};

export default async function AuthenticatePage({
  searchParams,
}: AuthenticatePageProps) {
  const { mode: rawMode } = await searchParams;
  const mode = rawMode === "register" ? "register" : "login";

  const heading = mode === "register" ? "Create an account" : "Log in";
  const switchHref =
    mode === "login" ? "/authenticate?mode=register" : "/authenticate?mode=login";
  const switchText =
    mode === "login" ? "Need an account? Register" : "Already have an account? Log in";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background text-foreground">
      <h1 className="text-4xl font-semibold">{heading}</h1>
      <AuthForm mode={mode} />
      <Link href={switchHref} className="text-sm underline">
        {switchText}
      </Link>
    </main>
  );
}
