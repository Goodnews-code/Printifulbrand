export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 border-2 border-brand-purple border-t-transparent animate-spin dark:border-brand-yellow dark:border-t-transparent" />
        <p className="font-ui text-sm text-muted">Loading…</p>
      </div>
    </div>
  );
}
