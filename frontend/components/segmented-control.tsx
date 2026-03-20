"use client";

import { cn } from "@/lib/utils";

interface SegmentedControlProps<T extends string> {
  options: { key: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Segmented control matching the Tabs look.
 * Rounded-rectangle segments with bg-base-200 container.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex h-9 items-center rounded-xl bg-base-200 p-1 gap-0.5",
        className,
      )}
    >
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1 text-xs font-medium text-base-content/40 transition-all",
            value === option.key
              ? "bg-base-100 text-base-content shadow-sm"
              : "hover:text-base-content",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
