import { cn } from "@/shared/lib/cn";

/** Decorative; pair it with a labelled role="status" region or aria-busy on the owning control. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-5 animate-spin-slow rounded-full border-2 border-current border-r-transparent",
        className,
      )}
    />
  );
}
