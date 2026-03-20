"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const v: Record<string, string> = {
      default: "btn-primary",
      destructive: "btn-error",
      outline: "btn-outline",
      secondary: "btn-secondary",
      ghost: "btn-ghost",
      link: "btn-link",
    };
    const s: Record<string, string> = {
      default: "btn-sm h-10 min-h-0 px-5",
      sm: "btn-xs h-8 min-h-0 px-4",
      lg: "btn-sm h-11 min-h-0 px-8",
      icon: "btn-sm btn-square h-9 min-h-0 w-9",
    };
    return (
      <button
        ref={ref}
        className={cn("btn no-animation font-medium", v[variant], s[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
