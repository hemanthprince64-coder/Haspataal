/* eslint-disable */
// Stub UI command component — replace with cmdk-based implementation when needed
'use client';
import React from 'react';

export const CommandDialog = ({ children, open, onOpenChange }: any) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20" onClick={() => onOpenChange?.(false)}>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg p-0 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export const CommandInput = ({ placeholder, ...props }: any) => (
  <input
    className="w-full px-4 py-3 text-sm bg-transparent border-b border-slate-200 dark:border-slate-700 outline-none placeholder:text-slate-400"
    placeholder={placeholder}
    {...props}
  />
);

export const CommandList = ({ children }: any) => (
  <div className="max-h-72 overflow-y-auto py-2">{children}</div>
);

export const CommandEmpty = ({ children }: any) => (
  <div className="py-6 text-center text-sm text-slate-500">{children}</div>
);

export const CommandGroup = ({ heading, children }: any) => (
  <div className="px-2 py-1">
    {heading && <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 px-2">{heading}</p>}
    {children}
  </div>
);

export const CommandItem = ({ children, onSelect, ...props }: any) => (
  <div
    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
    onClick={() => onSelect?.()}
    {...props}
  >
    {children}
  </div>
);

export const CommandSeparator = () => <hr className="my-2 border-slate-200 dark:border-slate-700" />;

export const Command = ({ children, className, ...props }: any) => (
  <div className={`w-full ${className || ''}`} {...props}>{children}</div>
);
