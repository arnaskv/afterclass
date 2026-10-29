import { cn } from "@/shared/lib/cn";

/** Decorative placeholder; the surrounding region owns the role="status" label. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-shimmer rounded-md bg-surface-muted", className)}
    />
  );
}
