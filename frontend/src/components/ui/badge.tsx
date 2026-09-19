import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200 font-medium",
    warning: "bg-amber-50 text-amber-900 border-amber-200 font-medium",
    danger: "bg-rose-50 text-rose-800 border-rose-200 font-medium",
    info: "bg-blue-50 text-blue-800 border-blue-200 font-medium",
    outline: "border-slate-300 text-slate-700 bg-transparent",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
