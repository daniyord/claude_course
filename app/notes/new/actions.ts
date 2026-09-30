"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createNote } from "@/lib/notes";

export type NewNoteState = { error: string | null };

const docSchema = z.looseObject({
  type: z.literal("doc"),
  content: z.array(z.unknown()).optional(),
});

const newNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or fewer"),
  content: z
    .string()
    .max(1_000_000, "Content is too large")
    .transform((value, ctx) => {
      try {
        return JSON.parse(value);
      } catch {
        ctx.addIssue({ code: "custom", message: "Invalid content" });
        return z.NEVER;
      }
    })
    .pipe(docSchema),
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
