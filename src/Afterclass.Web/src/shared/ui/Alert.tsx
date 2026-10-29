import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/cn";

const alertVariants = cva("rounded-md px-4 py-3 text-sm", {
  variants: {
    tone: {
      danger: "bg-danger-surface text-danger",
      success: "bg-success-surface text-success",
      neutral: "bg-surface-muted text-foreground",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export interface AlertProps
  extends ComponentProps<"div">, VariantProps<typeof alertVariants> {}

/** Errors interrupt (role="alert"); success and neutral messages are announced politely. */
export function Alert({ tone, className, ...props }: AlertProps) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(alertVariants({ tone }), className)}
      {...props}
    />
  );
}
