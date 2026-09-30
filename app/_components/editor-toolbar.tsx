"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useEditorState, type Editor } from "@tiptap/react";

type Tool = {
  id: string;
  label: string;
  shortcut?: string[];
  icon: ReactNode;
  isActive?: (editor: Editor) => boolean;
  canRun: (editor: Editor) => boolean;
  run: (editor: Editor) => void;
};

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function TextIcon({ children }: { children: ReactNode }) {
  return (
    <span aria-hidden="true" className="text-xs font-semibold">
      {children}
    </span>
  );
}

const groups: { label: string; tools: Tool[] }[] = [
  {
    label: "Text style",
    tools: [
      {
        id: "paragraph",
        label: "Normal text",
        shortcut: ["Mod", "Alt", "0"],
        icon: <TextIcon>Text</TextIcon>,
        isActive: (e) => e.isActive("paragraph"),
        canRun: (e) => e.can().setParagraph(),
        run: (e) => e.chain().focus().setParagraph().run(),
      },
      ...([1, 2, 3] as const).map<Tool>((level) => ({
        id: `h${level}`,
        label: `Heading ${level}`,
        shortcut: ["Mod", "Alt", String(level)],
        icon: <TextIcon>H{level}</TextIcon>,
        isActive: (e) => e.isActive("heading", { level }),
        canRun: (e) => e.can().toggleHeading({ level }),
        run: (e) => e.chain().focus().toggleHeading({ level }).run(),
      })),
    ],
  },
  {
    label: "Formatting",
    tools: [
      {
        id: "bold",
        label: "Bold",
        shortcut: ["Mod", "B"],
        icon: (
          <Icon>
            <path d="M6 12h9a4 4 0 0 1 0 8H6V4h8a4 4 0 0 1 0 8" />
          </Icon>
        ),
        isActive: (e) => e.isActive("bold"),
        canRun: (e) => e.can().toggleBold(),
        run: (e) => e.chain().focus().toggleBold().run(),
      },
      {
        id: "italic",
        label: "Italic",
        shortcut: ["Mod", "I"],
        icon: (
          <Icon>
            <path d="M19 4h-9M14 20H5M15 4 9 20" />
          </Icon>
        ),
        isActive: (e) => e.isActive("italic"),
        canRun: (e) => e.can().toggleItalic(),
        run: (e) => e.chain().focus().toggleItalic().run(),
      },
      {
        id: "code",
        label: "Inline code",
        shortcut: ["Mod", "E"],
        icon: (
          <Icon>
            <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />
          </Icon>
        ),
        isActive: (e) => e.isActive("code"),
        canRun: (e) => e.can().toggleCode(),
        run: (e) => e.chain().focus().toggleCode().run(),
      },
    ],
  },
  {
    label: "Blocks",
    tools: [
      {
        id: "bulletList",
        label: "Bullet list",
        shortcut: ["Mod", "Shift", "8"],
        icon: (
          <Icon>
            <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
          </Icon>
        ),
        isActive: (e) => e.isActive("bulletList"),
        canRun: (e) => e.can().toggleBulletList(),
        run: (e) => e.chain().focus().toggleBulletList().run(),
      },
      {
        id: "codeBlock",
        label: "Code block",
        shortcut: ["Mod", "Alt", "C"],
        icon: (
          <Icon>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="m10 9-3 3 3 3M14 15l3-3-3-3" />
          </Icon>
        ),
        isActive: (e) => e.isActive("codeBlock"),
        canRun: (e) => e.can().toggleCodeBlock(),
        run: (e) => e.chain().focus().toggleCodeBlock().run(),
      },
      {
        id: "horizontalRule",
        label: "Divider",
        icon: (
          <Icon>
            <path d="M3 12h18" />
          </Icon>
        ),
        canRun: (e) => e.can().setHorizontalRule(),
        run: (e) => e.chain().focus().setHorizontalRule().run(),
      },
    ],
  },
];

const allTools = groups.flatMap((group) => group.tools);

function formatShortcut(keys: string[], isMac: boolean) {
  return keys
    .map((key) => (key === "Mod" ? (isMac ? "⌘" : "Ctrl") : key === "Alt" && isMac ? "⌥" : key))
    .join(isMac ? "" : "+");
}

type EditorToolbarProps = {
  editor: Editor;
};

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  const [focusIndex, setFocusIndex] = useState(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent);

  const state = useEditorState({
    editor,
    selector: ({ editor }) =>
      Object.fromEntries(
        allTools.map((tool) => [
          tool.id,
          { active: tool.isActive?.(editor) ?? false, enabled: tool.canRun(editor) },
        ]),
      ),
  });

  // Derived during render rather than synced into state: if the remembered
  // button becomes disabled, the tab stop falls back to the first enabled one
  // so the toolbar always stays reachable with Tab.
  const enabledIndexes = allTools.flatMap((tool, index) => (state[tool.id].enabled ? [index] : []));
  const tabStopIndex = enabledIndexes.includes(focusIndex) ? focusIndex : (enabledIndexes[0] ?? -1);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (enabledIndexes.length === 0) return;
    const position = Math.max(enabledIndexes.indexOf(tabStopIndex), 0);
    const last = enabledIndexes.length - 1;
    const nextPosition = {
      ArrowRight: position === last ? 0 : position + 1,
      ArrowLeft: position === 0 ? last : position - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (nextPosition === undefined) return;
    event.preventDefault();
    // focusIndex is updated by the button's onFocus handler.
    buttonRefs.current[enabledIndexes[nextPosition]]?.focus();
  }

  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      onKeyDown={handleKeyDown}
      className="sticky top-0 z-10 flex rounded-t-md flex-wrap items-center gap-1 border-b border-foreground/10 bg-background/95 p-1.5 backdrop-blur"
    >
      {groups.map((group, groupIndex) => (
        <div key={group.label} role="group" aria-label={group.label} className="flex items-center gap-1">
          {groupIndex > 0 && (
            <span aria-hidden="true" className="mx-1 h-5 w-px bg-foreground/15" />
          )}
          {group.tools.map((tool) => {
            const buttonIndex = allTools.indexOf(tool);
            const { active, enabled } = state[tool.id];
            const shortcut = tool.shortcut && formatShortcut(tool.shortcut, isMac);
            return (
              <button
                key={tool.id}
                ref={(node) => {
                  buttonRefs.current[buttonIndex] = node;
                }}
                type="button"
                tabIndex={buttonIndex === tabStopIndex ? 0 : -1}
                onFocus={() => setFocusIndex(buttonIndex)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => tool.run(editor)}
                disabled={!enabled}
                aria-label={tool.label}
                aria-pressed={tool.isActive ? active : undefined}
                aria-keyshortcuts={tool.shortcut?.join("+").replace("Mod", isMac ? "Meta" : "Control")}
                title={shortcut ? `${tool.label} (${shortcut})` : tool.label}
                className="grid h-8 min-w-8 place-items-center rounded-md px-1.5 text-foreground/75 transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-foreground disabled:pointer-events-none disabled:opacity-35 aria-pressed:bg-foreground aria-pressed:text-background"
              >
                {tool.icon}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
