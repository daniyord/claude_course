"use client";

import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import { editorExtensions } from "@/lib/editor-extensions";
import EditorToolbar from "./editor-toolbar";

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
  "[&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6",
  "[&_code]:rounded [&_code]:bg-foreground/10 [&_code]:px-1 [&_code]:font-mono [&_code]:text-sm",
  "[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-foreground/10 [&_pre]:p-3",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_hr]:my-4 [&_hr]:border-foreground/20",
].join(" ");

export default function NoteEditor({ content, onChange, labelId }: NoteEditorProps) {
  const editor = useEditor({
    extensions: editorExtensions,
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

  return (
    <div className="rounded-md border border-foreground/20 focus-within:border-foreground/50">
      {editor ? (
        <EditorToolbar editor={editor} />
      ) : (
        <div aria-hidden="true" className="h-11.5 border-b border-foreground/10" />
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
