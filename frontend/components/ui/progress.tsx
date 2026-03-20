"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLProgressElement> {
  value?: number;
}

const Progress = React.forwardRef<HTMLProgressElement, ProgressProps>(
  ({ className, value, ...props }, ref) => (
    <progress
      ref={ref}
      className={cn("progress progress-primary w-full", className)}
      value={value}
      max={100}
      {...props}
    />
  )
);
Progress.displayName = "Progress";

export { Progress };
