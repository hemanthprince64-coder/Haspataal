"use client";

import { useState } from "react";
import { Building2, ChevronDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BranchSwitcher({ branches, activeBranchId }: { branches: any[], activeBranchId: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const activeBranch = branches.find(b => b.id === activeBranchId) || branches[0];

  const handleSwitch = async (id: string) => {
    // We'll use a simple document.cookie for now or a small API call
    document.cookie = `active_branch_id=${id}; path=/; max-age=31536000`;
    setOpen(false);
    router.refresh();
  };

  return (
    <div className="relative mb-6">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-2.5 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Building2 className="h-4 w-4 text-indigo-400 flex-shrink-0" />
          <span className="text-xs font-bold text-slate-200 truncate">{activeBranch?.name || "Main Campus"}</span>
        </div>
        <ChevronDown className="h-3 w-3 text-slate-500" />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {branches.map(branch => (
            <button
              key={branch.id}
              onClick={() => handleSwitch(branch.id)}
              className="w-full flex items-center justify-between p-2.5 text-xs text-left hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border-b border-slate-700 last:border-0"
            >
              <span>{branch.name}</span>
              {branch.id === activeBranchId && <Check className="h-3 w-3 text-indigo-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
