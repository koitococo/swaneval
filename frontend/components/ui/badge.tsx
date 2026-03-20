import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

const variantMap: Record<string, string> = {
  default: "badge-primary badge-soft",
  secondary: "badge-secondary",
  destructive: "badge-error badge-soft",
  outline: "badge-outline",
  success: "badge-success badge-soft",
  warning: "badge-warning badge-soft",
};

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn("badge badge-sm font-medium", variantMap[variant], className)}
      {...props}
    />
  );
}

export { Badge };
