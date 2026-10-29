import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/cn";

export function Card({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-surface p-6 shadow-card",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: ComponentProps<"h2">) {
  return <h2 className={cn("text-lg font-semibold", className)} {...props} />;
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("mt-1 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
