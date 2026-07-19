import React from 'react';

import Link from 'next/link';

export default function AutomationStudioPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Automation Studio</h1>
        <p className="text-gray-500 mt-2">
          Manage rules, workflows, approvals, and autonomous operations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Approvals */}
        <Link
          href="/automation/approvals"
          className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-500 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Approval Platform</h3>
            <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded">
              3 Pending
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            Review delegated, escalated, and pending approval requests across the ecosystem.
          </p>
        </Link>

        {/* Rules */}
        <Link
          href="/automation/rules"
          className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-500 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Decision Rules</h3>
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
              12 Active
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            Visual rule builder for governing autonomous decisions and execution plans.
          </p>
        </Link>

        {/* Workflows */}
        <Link
          href="/orchestration/workflows"
          className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-500 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Workflow Library</h3>
          </div>
          <p className="text-gray-500 text-sm">
            Manage standard operating procedures and orchestrated workflows.
          </p>
        </Link>

        {/* Executions */}
        <div className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 opacity-50 cursor-not-allowed">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Execution Monitor</h3>
          </div>
          <p className="text-gray-500 text-sm">
            Track active workflow runs, decisions, and automation success rates. (Coming Soon)
          </p>
        </div>

        {/* AI Authoring */}
        <div className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 opacity-50 cursor-not-allowed">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">AI Authoring</h3>
          </div>
          <p className="text-gray-500 text-sm">
            Use Copilot to generate rules, workflows, and semantic reports. (Coming Soon)
          </p>
        </div>
      </div>
    </div>
  );
}
