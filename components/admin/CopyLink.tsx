"use client";

import { useState } from "react";

export default function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="copy-link">
      <input readOnly value={link} onFocus={(e) => e.target.select()} />
      <button
        type="button"
        className="abtn abtn--ghost abtn--sm"
        onClick={async () => {
          await navigator.clipboard.writeText(link);
          setCopied(true);
        }}
      >
        {copied ? "Copié ✓" : "Copier"}
      </button>
    </div>
  );
}
