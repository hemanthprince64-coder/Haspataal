"use client"

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const SelectContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  label: string
  setLabel: (label: string) => void
} | null>(null)

const Select = ({ children, value, onValueChange, defaultValue }: any) => {
  const [open, setOpen] = React.useState(false)
  const [currentValue, setCurrentValue] = React.useState(value || defaultValue || "")
  const [label, setLabel] = React.useState("")

  React.useEffect(() => {
    if (value !== undefined) setCurrentValue(value)
  }, [value])

  const handleValueChange = (newValue: string) => {
    if (value === undefined) setCurrentValue(newValue)
    onValueChange?.(newValue)
    setOpen(false)
  }

  return (
    <SelectContext.Provider value={{ value: currentValue, onValueChange: handleValueChange, open, setOpen, label, setLabel }}>
      <div className="relative w-full">{children}</div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectTrigger must be used within Select")

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => context.setOpen(!context.open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectValue must be used within Select")
  return <span>{context.label || placeholder}</span>
}

const SelectContent = ({ children, className }: any) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectContent must be used within Select")
  if (!context.open) return null

  return (
    <>
      <div className="fixed inset-0 z-50" onClick={() => context.setOpen(false)} />
      <div className={cn(
        "absolute top-full z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white text-slate-950 shadow-md animate-in fade-in-0 zoom-in-95",
        className
      )}>
        <div className="p-1">{children}</div>
      </div>
    </>
  )
}

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, children, value, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectItem must be used within Select")

  const isSelected = context.value === value

  React.useEffect(() => {
    if (isSelected) context.setLabel(children as string)
  }, [isSelected, children, context])

  return (
    <div
      ref={ref}
      onClick={() => context.onValueChange(value)}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      <span>{children}</span>
    </div>
  )
})
SelectItem.displayName = "SelectItem"

export {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
}
