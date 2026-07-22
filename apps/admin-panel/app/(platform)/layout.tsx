import Link from 'next/link';
import { ScopeGate } from '@haspataal/admin-core';

import React from 'react';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <ScopeGate scope="PLATFORM">
      <div className="min-h-screen flex flex-col">
        {/* Topbar placeholder */}
        <header className="h-16 border-b flex items-center px-6 bg-white shrink-0">
          <div className="font-bold text-xl">Haspataal Platform Admin</div>
          <div className="ml-auto">{/* Command Palette Trigger */}</div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar nav placeholder */}
          <aside className="w-64 border-r bg-gray-50 flex flex-col overflow-y-auto shrink-0">
            <nav className="flex-1 p-4 space-y-1">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">
                Overview
              </div>
              <Link href="/dashboard" className="block px-3 py-2 rounded-md hover:bg-gray-200">
                Dashboard
              </Link>

              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">
                Hospitals
              </div>
              <Link href="/hospitals" className="block px-3 py-2 rounded-md hover:bg-gray-200">
                Hospital Management
              </Link>
              <Link href="/users" className="block px-3 py-2 rounded-md hover:bg-gray-200">
                Users & Identity
              </Link>
              <Link href="/networks" className="block px-3 py-2 rounded-md hover:bg-gray-200">
                Network Admin
              </Link>
              <Link href="/billing" className="block px-3 py-2 rounded-md hover:bg-gray-200">
                Subscription & SaaS
              </Link>

              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">
                Operations
              </div>
              <Link
                href="/orchestration/incident"
                className="block px-3 py-2 rounded-md hover:bg-gray-200"
              >
                Incident Center
              </Link>
              <Link
                href="/automation"
                className="block px-3 py-2 bg-purple-50 text-purple-700 font-medium rounded-md hover:bg-purple-100 mt-2"
              >
                ⚡ Automation Studio
              </Link>
              <Link href="/security" className="block px-3 py-2 rounded-md hover:bg-gray-200">
                Security Center
              </Link>
              <Link href="/audit" className="block px-3 py-2 rounded-md hover:bg-gray-200">
                Audit Logs
              </Link>
              <Link href="/compliance" className="block px-3 py-2 rounded-md hover:bg-gray-200">
                Compliance
              </Link>
              <Link href="/incidents" className="block px-3 py-2 rounded-md hover:bg-gray-200">
                Incidents
              </Link>
              <Link href="/recommendations" className="block px-3 py-2 rounded-md hover:bg-gray-200">
                Recommendations
              </Link>
              <Link href="/orchestration" className="block px-3 py-2 rounded-md hover:bg-gray-200">
                Workflows
              </Link>

              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">
                Ecosystem
              </div>
              <Link href="/marketplace" className="block px-3 py-2 rounded-md hover:bg-gray-200">
                Capability Marketplace
              </Link>
              <Link href="/gateway" className="block px-3 py-2 rounded-md hover:bg-gray-200">
                API Gateway
              </Link>
              <Link href="/developer" className="block px-3 py-2 rounded-md hover:bg-gray-200">
                Developer Portal
              </Link>
              <Link href="/events" className="block px-3 py-2 rounded-md hover:bg-gray-200">
                Event Bus Console
              </Link>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">
                Intelligence
              </div>
              <Link href="/executive/ceo" className="block px-3 py-2 rounded-md hover:bg-gray-200">
                CEO Dashboard
              </Link>
              <Link href="/executive/coo" className="block px-3 py-2 rounded-md hover:bg-gray-200">
                COO Dashboard
              </Link>
              <Link href="/executive/cto" className="block px-3 py-2 rounded-md hover:bg-gray-200">
                CTO Dashboard
              </Link>
              <Link href="/executive/cmo" className="block px-3 py-2 rounded-md hover:bg-gray-200">
                CMO Dashboard
              </Link>
              <Link
                href="/copilot"
                className="block px-3 py-2 bg-blue-50 text-blue-700 font-medium rounded-md hover:bg-blue-100 mt-2"
              >
                ✨ AI Copilot
              </Link>
            </nav>
          </aside>

          {/* Main content area */}
          <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6">{children}</main>
        </div>
      </div>
    </ScopeGate>
  );
}
