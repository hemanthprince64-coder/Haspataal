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
              <a href="/dashboard" className="block px-3 py-2 rounded-md hover:bg-gray-200">
                Dashboard
              </a>

              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">
                Hospitals
              </div>
              <a href="/hospitals" className="block px-3 py-2 rounded-md hover:bg-gray-200">
                Hospital Management
              </a>
              <a href="/users" className="block px-3 py-2 rounded-md hover:bg-gray-200">
                Users & Identity
              </a>
              <a href="/networks" className="block px-3 py-2 rounded-md hover:bg-gray-200">
                Network Admin
              </a>
              <a href="/billing" className="block px-3 py-2 rounded-md hover:bg-gray-200">
                Subscription & SaaS
              </a>

              {/* Add more nav items from spec module table... */}
            </nav>
          </aside>

          {/* Main content area */}
          <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6">{children}</main>
        </div>
      </div>
    </ScopeGate>
  );
}
