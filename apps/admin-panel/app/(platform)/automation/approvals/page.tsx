'use client';
import React from 'react';

export default function ApprovalsInboxPage() {
  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Approval Inbox</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and review pending platform authorizations.
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left Column: Inbox Categories */}
        <div className="w-64 shrink-0 space-y-2">
          <button className="w-full text-left px-4 py-2.5 bg-blue-50 text-blue-700 font-medium rounded-lg flex justify-between items-center">
            Pending
            <span className="bg-blue-100 text-blue-800 text-xs py-0.5 px-2 rounded-full">24</span>
          </button>
          <button className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg flex justify-between items-center">
            Assigned to Me
            <span className="bg-gray-200 text-gray-800 text-xs py-0.5 px-2 rounded-full">6</span>
          </button>
          <button className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg flex justify-between items-center">
            Awaiting Others
            <span className="bg-gray-200 text-gray-800 text-xs py-0.5 px-2 rounded-full">8</span>
          </button>
          <button className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg flex justify-between items-center">
            Delegated
            <span className="bg-gray-200 text-gray-800 text-xs py-0.5 px-2 rounded-full">2</span>
          </button>
          <button className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg flex justify-between items-center">
            Escalated
            <span className="bg-red-100 text-red-800 text-xs py-0.5 px-2 rounded-full font-bold">
              1
            </span>
          </button>
          <div className="my-4 border-t border-gray-200"></div>
          <button className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg flex justify-between items-center">
            Completed
          </button>
          <button className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg flex justify-between items-center">
            Rejected
          </button>
          <button className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg flex justify-between items-center">
            Timed Out
          </button>
        </div>

        {/* Right Column: Detail View */}
        <div className="flex-1 bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
          <div className="p-6 border-b bg-gray-50/50">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 uppercase tracking-wide">
                  Decision Execution
                </span>
                <h2 className="text-xl font-bold mt-2">Increase Triage Staffing (req-89a1f)</h2>
                <p className="text-sm text-gray-500 mt-1">Created 2 hours ago via Automated Rule</p>
              </div>
              <span className="px-3 py-1 rounded-md bg-amber-100 text-amber-800 text-sm font-semibold border border-amber-200">
                PENDING (MAJORITY)
              </span>
            </div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto space-y-8">
            {/* Context blocks */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Supporting Prediction
              </h3>
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                    87%
                  </div>
                  <div>
                    <p className="font-medium">SLA Breach Probability (Triage)</p>
                    <p className="text-sm text-gray-500">
                      Queue latency has increased by 42% over the last six hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Business Rule
              </h3>
              <div className="bg-white border rounded-lg p-4 shadow-sm text-sm font-mono text-gray-700">
                IF (ICU_Occupancy &gt; 90% AND Triage_Queue &gt; 20) THEN CREATE_STAFFING_WORKFLOW
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Execution Plan
              </h3>
              <div className="bg-white border rounded-lg p-4 shadow-sm text-sm font-mono text-blue-800 bg-blue-50/50">
                {`{
  "action": "CREATE_STAFFING_WORKFLOW",
  "department": "TRIAGE",
  "requestedCount": 2,
  "role": "NURSE_PRACTITIONER"
}`}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Approvals (2/3 Required)
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                  <span className="text-sm font-medium">Operations Manager (Alice)</span>
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">
                    APPROVED
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                  <span className="text-sm font-medium">Medical Director (You)</span>
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    PENDING
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                  <span className="text-sm font-medium">Nursing Director (Bob)</span>
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    PENDING
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t bg-gray-50 flex gap-3 justify-end shrink-0">
            <button className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors">
              Reject
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
              Approve Execution
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
