export default function Flash({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null;
  return (
    <div className={`flash ${error ? "flash--error" : "flash--ok"}`} role="status">
      {error ?? ok}
    </div>
  );
}
