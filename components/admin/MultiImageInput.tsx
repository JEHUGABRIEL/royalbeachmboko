"use client";

import { useRef, useState } from "react";
import { shrink } from "./shrink";

const MAX_FILES = 8;

export default function MultiImageInput({ name }: { name: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [message, setMessage] = useState<string>();

  return (
    <div className="image-input">
      <input
        ref={ref}
        type="file"
        name={name}
        multiple
        required
        accept="image/jpeg,image/png,image/webp"
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []).slice(0, MAX_FILES);
          setMessage(files.length ? "Préparation des images…" : undefined);
          const dt = new DataTransfer();
          for (const f of files) dt.items.add(await shrink(f));
          ref.current!.files = dt.files;
          setPreviews(Array.from(dt.files, (f) => URL.createObjectURL(f)));
          setMessage((e.target.files?.length ?? 0) > MAX_FILES ? `${MAX_FILES} photos maximum par envoi.` : undefined);
        }}
      />
      {message && <small>{message}</small>}
      {previews.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {previews.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" style={{ width: 64, height: 48 }} />
          ))}
        </div>
      )}
    </div>
  );
}
