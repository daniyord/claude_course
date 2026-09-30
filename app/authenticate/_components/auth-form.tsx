"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type AuthMode = "login" | "register";

type AuthFormState = { error: string | null };

type AuthFormProps = {
  mode: AuthMode;
};

const initialState: AuthFormState = { error: null };

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();

  async function submitAuth(
    _prevState: AuthFormState,
    formData: FormData,
  ): Promise<AuthFormState> {
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    const { error } =
      mode === "register"
        ? await authClient.signUp.email({
            name: String(formData.get("name")),
            email,
            password,
          })
        : await authClient.signIn.email({ email, password });

    if (error) {
      return { error: error.message ?? "Something went wrong" };
    }

    router.push("/dashboard");
    router.refresh();
    return initialState;
  }

  const [state, formAction, isPending] = useActionState(
    submitAuth,
    initialState,
  );

  const submitLabel = isPending
    ? mode === "register"
      ? "Creating account…"
      : "Signing in…"
    : mode === "register"
      ? "Create account"
      : "Log in";

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      {mode === "register" && (
        <label className="flex flex-col gap-1 text-sm">
          Name
          <input
            type="text"
            name="name"
            required
            maxLength={100}
            autoComplete="name"
            className="rounded-md border border-foreground/20 bg-background px-3 py-2"
          />
        </label>
      )}
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          type="email"
          name="email"
          required
          className="rounded-md border border-foreground/20 bg-background px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Password
        <input
          type="password"
          name="password"
          required
          minLength={8}
          className="rounded-md border border-foreground/20 bg-background px-3 py-2"
        />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
      >
        {submitLabel}
      </button>
    </form>
  );
}
