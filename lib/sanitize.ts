// C0/C1 control characters (except tab and newline), zero-width characters,
// and bidi overrides that can visually spoof text.
const UNSAFE_CHARS = /[\u0000-\u0008\u000B-\u001F\u007F-\u009F​-‏‪-‮⁠-⁤⁦-⁩﻿]/g;

export function sanitizeLine(value: string): string {
  return value
    .normalize("NFC")
    .replace(UNSAFE_CHARS, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeMultiline(value: string): string {
  return value
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(UNSAFE_CHARS, "");
}
