"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { sanitizeNoteContent } from "@/lib/note-content";
import { createNote } from "@/lib/notes";
import { sanitizeLine } from "@/lib/sanitize";

export type NewNoteState = { error: string | null };

const GENERIC_SAVE_ERROR = "We couldn't save your note right now. Please try again in a moment.";

const newNoteSchema = z.object({
  title: z
    .string({ error: "Please enter a title." })
    .max(1_000, "Title must be 200 characters or fewer")
    .transform(sanitizeLine)
    .pipe(
      z
        .string()
        .min(1, "Please enter a title.")
        .max(200, "Title must be 200 characters or fewer"),
    ),
  // Kept well under the 1 MB Server Action body limit so oversized notes get a
  // validation message rather than a framework error.
  content: z
    .string({ error: "We couldn't read your note's content. Please try again." })
    .max(500_000, "This note is too long to save. Try splitting it into smaller notes.")
    .transform((value, ctx) => {
      try {
        return sanitizeNoteContent(JSON.parse(value));
      } catch {
        ctx.addIssue({
          code: "custom",
          message: "Your note contains formatting we can't save. Please remove it and try again.",
        });
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
    return { error: parsed.error.issues[0]?.message ?? GENERIC_SAVE_ERROR };
  }

  try {
    await createNote(user.id, {
      title: parsed.data.title,
      contentJson: JSON.stringify(parsed.data.content),
    });
  } catch (error) {
    console.error("Failed to create note", { userId: user.id, error });
    return { error: GENERIC_SAVE_ERROR };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
