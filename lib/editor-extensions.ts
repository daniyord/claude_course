import StarterKit from '@tiptap/starter-kit';

// Shared by the client editor and server-side content validation, so both
// accept exactly the same document schema.
export const editorExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    blockquote: false,
    orderedList: false,
    strike: false,
    link: false,
    underline: false,
  }),
];

export const HEADING_LEVELS = [1, 2, 3];
