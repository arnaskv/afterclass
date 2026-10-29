import { useId, type ComponentProps } from "react";

import { cn } from "@/shared/lib/cn";

export interface TextFieldProps extends Omit<ComponentProps<"input">, "id"> {
  label: string;
  description?: string;
  error?: string;
}

/** Labelled input with its description and validation message kept next to the field. */
export function TextField({
  label,
  description,
  error,
  className,
  ...props
}: TextFieldProps) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [descriptionId, errorId].filter(Boolean).join(" ") || undefined
        }
        className={cn(
          "h-10 rounded-md border border-border bg-surface px-3 text-sm transition-colors duration-(--duration-fast)",
          "placeholder:text-muted-foreground aria-invalid:border-danger",
        )}
        {...props}
      />
      {description && (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
