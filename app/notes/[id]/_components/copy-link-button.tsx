'use client';

import { useState } from 'react';

export default function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(new URL(path, window.location.origin).toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type='button'
      onClick={copy}
      className='rounded-md border border-foreground/20 px-2 py-0.5 text-xs font-medium hover:bg-foreground/5'
    >
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  );
}
