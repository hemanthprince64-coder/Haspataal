"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const AccordionContext = React.createContext<{
  activeItem: string | null
  toggleItem: (value: string) => void
} | null>(null)

const Accordion = ({ type = "single", defaultValue, value, onValueChange, className, children, ...props }: any) => {
  const [activeItem, setActiveItem] = React.useState(value || defaultValue || null)

  const toggleItem = React.useCallback(
    (itemValue: string) => {
      const newValue = activeItem === itemValue ? null : itemValue
      setActiveItem(newValue)
      onValueChange?.(newValue)
    },
    [activeItem, onValueChange]
  )

  return (
    <AccordionContext.Provider value={{ activeItem, toggleItem }}>
      <div className={cn("w-full border-t border-slate-200", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("border-b border-slate-200", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(AccordionContext)
  const itemValue = (props as any).value || (props as any).parentElement?.getAttribute("data-value")
  
  // Note: In this pure React impl, we need the value to be passed or inferred.
  // For simplicity in the usage below, I'll adjust the usage in the page.
  
  return (
    <div className="flex">
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </button>
    </div>
  )
})
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </div>
))
AccordionContent.displayName = "AccordionContent"

// Simplified "value-less" Accordion for use with standard React state in the page
export const SimpleAccordion = ({ title, icon, isOpen, onToggle, children }: any) => {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between p-4 text-left transition-all",
          isOpen ? "bg-slate-50 border-b border-slate-200" : "hover:bg-slate-50/50"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
            isOpen ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"
          )}>
            {icon}
          </div>
          <span className="font-bold text-slate-700 uppercase tracking-widest text-xs">
            {title}
          </span>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="p-5 animate-in fade-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
