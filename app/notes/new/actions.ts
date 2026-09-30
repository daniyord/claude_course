"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { sanitizeNoteContent } from "@/lib/note-content";
import { createNote } from "@/lib/notes";
import { sanitizeLine } from "@/lib/sanitize";

export type NewNoteState = { error: string | null };

const newNoteSchema = z.object({
  title: z
    .string()
    .max(1_000, "Title must be 200 characters or fewer")
    .transform(sanitizeLine)
    .pipe(
      z
        .string()
        .min(1, "Title is required")
        .max(200, "Title must be 200 characters or fewer"),
    ),
  // Kept well under the 1 MB Server Action body limit so oversized notes get a
  // validation message rather than a framework error.
  content: z
    .string()
    .max(500_000, "Content is too large")
    .transform((value, ctx) => {
      try {
        return sanitizeNoteContent(JSON.parse(value));
      } catch {
        ctx.addIssue({ code: "custom", message: "Invalid content" });
        return z.NEVER;
      }
    }),
});

export async function createNoteAction(
  _prevState: NewNoteState,
  formData: FormData,
): Promise<NewNoteState> {
  const user = await requireUser();

  const parsed = newNoteSchema.safeParse({
    title: formData.get("title") ?? "",
    content: formData.get("content") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await createNote(user.id, {
    title: parsed.data.title,
    contentJson: JSON.stringify(parsed.data.content),
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
