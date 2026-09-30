import { z } from "zod";
import { sanitizeNoteContent } from "@/lib/note-content";
import { sanitizeLine } from "@/lib/sanitize";

export const noteInputSchema = z.object({
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
