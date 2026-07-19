import React from 'react';

import Link from 'next/link';

export default function AutomationStudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full bg-white shadow-sm border rounded-xl overflow-hidden">
      {/* Secondary Sidebar for Automation Studio */}
      <aside className="w-56 border-r bg-gray-50 flex flex-col shrink-0">
        <div className="p-4 border-b bg-white">
          <h2 className="font-bold text-gray-900 tracking-tight">Automation Studio</h2>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <Link
            href="/automation"
            className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-200"
          >
            📋 Dashboard
          </Link>
          <Link
            href="/automation/rules"
            className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-200"
          >
            ⚡ Rules
          </Link>
          <Link
            href="/automation/executions"
            className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-200"
          >
            🔄 Executions
          </Link>
          <Link
            href="/automation/approvals"
            className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-200"
          >
            ✅ Approvals
          </Link>
          <Link
            href="/automation/analytics"
            className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-200"
          >
            📈 Analytics
          </Link>
          <Link
            href="/automation/simulations"
            className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-200"
          >
            🧪 Simulations
          </Link>
          <Link
            href="/automation/templates"
            className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-200"
          >
            📚 Templates
          </Link>
          <Link
            href="/automation/audit"
            className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-200"
          >
            📝 Audit
          </Link>
          <div className="mt-4 pt-4 border-t">
            <Link
              href="/orchestration/workflows"
              className="block px-3 py-2 text-sm text-gray-500 rounded-md hover:bg-gray-200"
            >
              Workflow Builder
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 overflow-y-auto bg-gray-50/30">{children}</main>
    </div>
  );
}
