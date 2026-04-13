"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <div className="relative inline-flex items-center">
    <input
      type="checkbox"
      ref={ref}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-slate-200 border-slate-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-slate-900 data-[state=checked]:text-slate-50",
        "appearance-none cursor-pointer checked:bg-slate-900 checked:border-slate-900",
        className
      )}
      {...props}
    />
    <Check className="absolute left-[2px] top-[2px] h-3 w-3 text-white transition-opacity opacity-0 pointer-events-none peer-checked:opacity-100" />
  </div>
))
Checkbox.displayName = "Checkbox"

export { Checkbox }
