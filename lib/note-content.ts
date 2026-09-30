import { getSchema, type JSONContent } from "@tiptap/core";
import { editorExtensions, HEADING_LEVELS } from "@/lib/editor-extensions";
import { sanitizeMultiline } from "@/lib/sanitize";

const schema = getSchema(editorExtensions);

const CODE_LANGUAGE = /^[a-z0-9+#.-]{1,32}$/i;

export class InvalidNoteContentError extends Error {}

function cleanNode(node: JSONContent): JSONContent | null {
  if (node.type === "text") {
    const text = sanitizeMultiline(node.text ?? "");
    return text ? { ...node, text } : null;
  }

  const attrs = node.attrs ? { ...node.attrs } : undefined;
  if (node.type === "heading" && !HEADING_LEVELS.includes(Number(attrs?.level))) {
    throw new InvalidNoteContentError("Invalid heading level");
  }
  if (node.type === "codeBlock" && attrs) {
    const language = attrs.language;
    attrs.language = typeof language === "string" && CODE_LANGUAGE.test(language) ? language : null;
  }

  const content = node.content
    ?.map(cleanNode)
    .filter((child): child is JSONContent => child !== null);

  return { ...node, attrs, content };
}

/**
 * Parses untrusted TipTap JSON against the editor schema and returns a
 * canonical document: unknown node types, marks and attributes are rejected
 * or dropped, and text is stripped of control / invisible characters.
 */
export function sanitizeNoteContent(raw: unknown): JSONContent {
  try {
    const doc = raw as JSONContent;
    if (doc?.type === "doc" && !doc.content?.length) {
      return schema.topNodeType.createAndFill()!.toJSON() as JSONContent;
    }

    const parsed = schema.nodeFromJSON(raw);
    parsed.check();
    if (parsed.type.name !== "doc") throw new Error("Root must be a doc");

    const cleaned = cleanNode(parsed.toJSON() as JSONContent);
    const node = schema.nodeFromJSON(cleaned);
    node.check();
    return node.toJSON() as JSONContent;
  } catch {
    throw new InvalidNoteContentError("Invalid note content");
  }
}

export function parseNoteContent(contentJson: string): JSONContent {
  try {
    return JSON.parse(contentJson) as JSONContent;
  } catch {
    return { type: "doc", content: [] };
  }
}
