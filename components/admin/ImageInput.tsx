"use client";

import { useRef, useState } from "react";
import { shrink } from "./shrink";

export default function ImageInput({ name, required, current }: { name: string; required?: boolean; current?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(current);
  const [busy, setBusy] = useState(false);

  return (
    <div className="image-input">
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" />
      )}
      <input
        ref={ref}
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/webp"
        required={required}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          try {
            const small = await shrink(file);
            const dt = new DataTransfer();
            dt.items.add(small);
            ref.current!.files = dt.files;
            setPreview(URL.createObjectURL(small));
          } finally {
            setBusy(false);
          }
        }}
      />
      {busy && <small>Préparation de l&apos;image…</small>}
    </div>
  );
}
