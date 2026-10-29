import { Spinner } from "./Spinner";

/** Only for application and session initialization; regions use skeletons or compact indicators. */
export function FullScreenLoader({ label }: { label: string }) {
  return (
    <div
      role="status"
      className="flex min-h-dvh items-center justify-center gap-3 text-muted-foreground"
    >
      <Spinner />
      <span>{label}</span>
    </div>
  );
}
