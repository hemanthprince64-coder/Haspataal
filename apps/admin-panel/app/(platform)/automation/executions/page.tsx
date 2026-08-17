'use client';
import React from 'react';

export default function ExecutionsMonitorPage() {
  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Execution Monitor</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track the lifecycle of autonomous decisions and workflow executions.
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-4">
          <input
            type="text"
            placeholder="Search Execution ID..."
            className="border rounded-md px-3 py-1.5 text-sm w-64"
          />
          <select className="border rounded-md px-3 py-1.5 text-sm bg-white">
            <option>All Statuses</option>
            <option>Executing</option>
            <option>Awaiting Approval</option>
            <option>Completed</option>
          </select>
        </div>

        <div className="p-6">
          <div className="border rounded-xl p-6 relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold">req-89a1f</h3>
                <p className="text-sm text-gray-500">ICU Staffing Trigger (Hospital h-102)</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                EXECUTING WORKFLOW
              </span>
            </div>

            {/* Timeline View */}
            <div className="relative border-l-2 border-blue-200 ml-4 space-y-8 pb-4">
              <div className="relative">
                <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-blue-500 border-2 border-white"></div>
                <div className="ml-6">
                  <h4 className="text-sm font-bold text-gray-900">Prediction Generated</h4>
                  <p className="text-xs text-gray-500">Nov 12, 14:30:01</p>
                  <p className="text-sm text-gray-700 mt-1">
                    SLA Breach Probability (87%) detected by Prediction Service.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-blue-500 border-2 border-white"></div>
                <div className="ml-6">
                  <h4 className="text-sm font-bold text-gray-900">Decision Created</h4>
                  <p className="text-xs text-gray-500">Nov 12, 14:30:03</p>
                  <p className="text-sm text-gray-700 mt-1">
                    Decision Engine matched Rule v1.0 and drafted Execution Plan.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-blue-500 border-2 border-white"></div>
                <div className="ml-6">
                  <h4 className="text-sm font-bold text-gray-900">Approval Requested</h4>
                  <p className="text-xs text-gray-500">Nov 12, 14:30:05</p>
                  <p className="text-sm text-gray-700 mt-1">
                    Approval Platform initiated MAJORITY policy request.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-blue-500 border-2 border-white"></div>
                <div className="ml-6">
                  <h4 className="text-sm font-bold text-gray-900">Approved</h4>
                  <p className="text-xs text-gray-500">Nov 12, 14:45:12</p>
                  <p className="text-sm text-gray-700 mt-1">
                    Approved by Alice (Operations Manager) and Bob (Nursing Director).
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-blue-500 border-2 border-white animate-pulse"></div>
                <div className="ml-6">
                  <h4 className="text-sm font-bold text-blue-700">
                    Workflow Started (In Progress)
                  </h4>
                  <p className="text-xs text-gray-500">Nov 12, 14:45:14</p>
                  <p className="text-sm text-gray-700 mt-1">
                    Workflow Engine executing `staffing_expansion` playbook.
                  </p>
                </div>
              </div>

              <div className="relative opacity-40">
                <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-gray-300 border-2 border-white"></div>
                <div className="ml-6">
                  <h4 className="text-sm font-bold text-gray-900">Workflow Completed</h4>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
