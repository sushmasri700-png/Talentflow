// src/components/ui/spinner.jsx
import React from "react";
import { cn } from "@/lib/utils"; // shadcn utility

export function Spinner({ className }) {
  return (
    <div
      className={cn(
        "h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-transparent",
        className
      )}
    />
  );
}
