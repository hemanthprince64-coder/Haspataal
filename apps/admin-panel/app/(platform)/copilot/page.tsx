'use client';

import React, { useState } from 'react';

export default function CopilotWorkspacePage() {
  const [activeCopilot, setActiveCopilot] = useState('OPERATIONS');

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Top Bar - Copilot Selector */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold text-gray-900">Platform AI Copilot</h1>
        <select
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
          value={activeCopilot}
          onChange={(e) => setActiveCopilot(e.target.value)}
        >
          <option value="OPERATIONS">Operations Copilot</option>
          <option value="CLINICAL">Clinical Copilot</option>
          <option value="FINANCE">Finance Copilot</option>
          <option value="EXECUTIVE">Executive Copilot</option>
          <option value="COMPLIANCE">Compliance Copilot</option>
          <option value="DEVELOPER">Developer Copilot</option>
        </select>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Conversation */}
        <div className="w-1/3 bg-gray-50 border-r flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm text-sm border border-gray-100">
              <span className="font-semibold text-blue-600">Copilot</span>
              <p className="mt-1">
                I have evaluated the recent predictions from the Decision Engine. There is an 87%
                probability of an SLA breach in the Triage Workflow.
              </p>
            </div>
          </div>
          <div className="p-4 bg-white border-t">
            <input
              type="text"
              placeholder="Ask for details or approve actions..."
              className="w-full bg-gray-100 border-transparent rounded-lg px-4 py-3 text-sm focus:border-blue-500 focus:bg-white focus:ring-0"
            />
          </div>
        </div>

        {/* Right Panel: Execution Context */}
        <div className="w-2/3 bg-white p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-6">Decision Context</h2>

          <div className="space-y-6">
            {/* Supporting Evidence */}
            <div className="border rounded-xl p-5 bg-gray-50/50">
              <h3 className="font-medium text-gray-900 flex items-center mb-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Explanation (from Decision Engine)
              </h3>
              <p className="text-sm text-gray-600">
                Queue latency has increased by 42% over the last six hours, and historical data
                shows similar conditions resulted in SLA breaches. Creating a staffing workflow is
                recommended.
              </p>
              <div className="mt-4 flex gap-2">
                <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-md font-mono">
                  Prediction Insight: p-88f2a
                </span>
                <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-md font-mono">
                  Decision Rule: rule-staff-4
                </span>
              </div>
            </div>

            {/* Workflow Preview */}
            <div className="border border-blue-100 rounded-xl p-5 bg-blue-50/30">
              <h3 className="font-medium text-blue-900 mb-3">Proposed Execution Plan</h3>
              <div className="bg-white border p-4 rounded-lg text-sm font-mono text-gray-700">
                {`{
  "actionType": "CREATE_STAFFING_WORKFLOW",
  "targetQueue": "triage_main",
  "allocationCount": 2,
  "requiresApproval": true,
  "timeout": "2h"
}`}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
                Approve Execution Plan
              </button>
              <button className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 shadow-sm transition-colors">
                Reject & Provide Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
