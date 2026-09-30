"use client";

import { EditorContent, useEditor, useEditorState, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type NoteEditorProps = {
  content?: JSONContent;
  onChange: (json: JSONContent) => void;
  labelId: string;
};

const contentClassName = [
  "min-h-64 px-4 py-3 focus:outline-none",
  "[&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-2xl [&_h1]:font-semibold",
  "[&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold",
  "[&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:text-lg [&_h3]:font-semibold",
  "[&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6",
  "[&_code]:rounded [&_code]:bg-foreground/10 [&_code]:px-1 [&_code]:font-mono [&_code]:text-sm",
  "[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-foreground/10 [&_pre]:p-3",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_hr]:my-4 [&_hr]:border-foreground/20",
].join(" ");

export default function NoteEditor({ content, onChange, labelId }: NoteEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
        underline: false,
      }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: contentClassName,
        role: "textbox",
        "aria-multiline": "true",
        "aria-labelledby": labelId,
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });

  const active = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive("bold") ?? false,
      italic: editor?.isActive("italic") ?? false,
      h1: editor?.isActive("heading", { level: 1 }) ?? false,
      h2: editor?.isActive("heading", { level: 2 }) ?? false,
      h3: editor?.isActive("heading", { level: 3 }) ?? false,
      paragraph: editor?.isActive("paragraph") ?? false,
      bulletList: editor?.isActive("bulletList") ?? false,
      code: editor?.isActive("code") ?? false,
      codeBlock: editor?.isActive("codeBlock") ?? false,
    }),
  });

  const tools = editor
    ? [
        { label: "Bold", text: "B", pressed: active?.bold, run: () => editor.chain().focus().toggleBold().run() },
        { label: "Italic", text: "I", pressed: active?.italic, run: () => editor.chain().focus().toggleItalic().run() },
        { label: "Heading 1", text: "H1", pressed: active?.h1, run: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
        { label: "Heading 2", text: "H2", pressed: active?.h2, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
        { label: "Heading 3", text: "H3", pressed: active?.h3, run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
        { label: "Paragraph", text: "¶", pressed: active?.paragraph, run: () => editor.chain().focus().setParagraph().run() },
        { label: "Bullet list", text: "•", pressed: active?.bulletList, run: () => editor.chain().focus().toggleBulletList().run() },
        { label: "Inline code", text: "</>", pressed: active?.code, run: () => editor.chain().focus().toggleCode().run() },
        { label: "Code block", text: "{ }", pressed: active?.codeBlock, run: () => editor.chain().focus().toggleCodeBlock().run() },
        { label: "Horizontal rule", text: "—", run: () => editor.chain().focus().setHorizontalRule().run() },
      ]
    : [];

  return (
    <div className="overflow-hidden rounded-md border border-foreground/20 focus-within:border-foreground/50">
      <div
        role="toolbar"
        aria-label="Formatting"
        className="flex flex-wrap gap-1 border-b border-foreground/10 bg-foreground/[0.03] p-1.5"
      >
        {tools.map((tool) => (
          <button
            key={tool.label}
            type="button"
            onClick={tool.run}
            aria-label={tool.label}
            title={tool.label}
            aria-pressed={tool.pressed === undefined ? undefined : tool.pressed}
            className="min-w-8 rounded px-2 py-1 font-mono text-xs font-medium text-foreground/80 transition-colors hover:bg-foreground/10 focus-visible:outline-2 focus-visible:outline-foreground aria-pressed:bg-foreground aria-pressed:text-background"
          >
            {tool.text}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
