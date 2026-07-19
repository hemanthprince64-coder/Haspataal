'use client';
import React from 'react';

export default function VisualRuleBuilderPage() {
  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Visual Rule Builder</h1>
          <p className="text-sm text-gray-500 mt-1">
            Design, simulate, and publish autonomous decision rules.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors">
            🧪 Run Simulation
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors">
            Publish Rule
          </button>
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100vh-12rem)]">
        {/* Left Column: AST Expression Tree */}
        <div className="flex-1 bg-white border rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Expression Tree</h2>
            <div className="flex gap-2">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                Valid AST
              </span>
              <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded font-medium">
                v1.0 (Draft)
              </span>
            </div>
          </div>

          <div className="p-8 flex-1 overflow-y-auto bg-gray-50/30">
            {/* Visual Nodes representation */}
            <div className="space-y-4 max-w-2xl mx-auto">
              {/* IF Block */}
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 shadow-sm relative">
                <div className="absolute -left-3 -top-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                  WHEN
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <select
                    className="border border-gray-300 rounded p-2 text-sm bg-white font-medium"
                    defaultValue="icu_occupancy"
                  >
                    <option value="icu_occupancy">ICU Occupancy</option>
                    <option value="triage_queue">Triage Queue</option>
                  </select>
                  <select
                    className="border border-gray-300 rounded p-2 text-sm bg-white"
                    defaultValue="gt"
                  >
                    <option value="gt">&gt;</option>
                    <option value="lt">&lt;</option>
                    <option value="eq">=</option>
                  </select>
                  <input
                    type="text"
                    className="border border-gray-300 rounded p-2 text-sm bg-white w-24"
                    defaultValue="90%"
                  />

                  <span className="text-sm font-semibold text-gray-500 mx-2">FOR</span>
                  <input
                    type="text"
                    className="border border-gray-300 rounded p-2 text-sm bg-white w-24"
                    defaultValue="2 HOURS"
                  />
                </div>
              </div>

              {/* AND Block */}
              <div className="flex justify-center">
                <span className="bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
                  AND
                </span>
              </div>

              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <select
                    className="border border-gray-300 rounded p-2 text-sm bg-white font-medium"
                    defaultValue="health_score"
                  >
                    <option value="health_score">Hospital Health</option>
                    <option value="staff_availability">Staff Availability</option>
                  </select>
                  <select
                    className="border border-gray-300 rounded p-2 text-sm bg-white"
                    defaultValue="lt"
                  >
                    <option value="gt">&gt;</option>
                    <option value="lt">&lt;</option>
                  </select>
                  <input
                    type="text"
                    className="border border-gray-300 rounded p-2 text-sm bg-white w-24"
                    defaultValue="75"
                  />
                </div>
              </div>

              {/* THEN Block */}
              <div className="mt-8 border border-purple-200 bg-purple-50 rounded-lg p-4 shadow-sm relative">
                <div className="absolute -left-3 -top-3 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                  THEN
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <select
                    className="border border-gray-300 rounded p-2 text-sm bg-white font-medium"
                    defaultValue="create_workflow"
                  >
                    <option value="create_workflow">Create Workflow</option>
                    <option value="send_alert">Send Alert</option>
                  </select>
                  <select
                    className="border border-gray-300 rounded p-2 text-sm bg-white"
                    defaultValue="staffing"
                  >
                    <option value="staffing">Staffing Expansion</option>
                    <option value="incident">Incident Triage</option>
                  </select>
                </div>
                <div className="mt-3 text-xs text-purple-700 bg-purple-100 p-2 rounded">
                  Requires Approval: MAJORITY (Operations Manager, Medical Director, Nursing
                  Director)
                </div>
              </div>

              <button className="mt-6 w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg font-medium hover:border-gray-400 hover:text-gray-700 transition-colors">
                + Add Condition Node
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Code Preview */}
        <div className="w-80 shrink-0 bg-gray-900 border border-gray-800 rounded-xl shadow-sm flex flex-col overflow-hidden text-gray-300">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold text-white text-sm">DecisionEngine.json</h2>
            <span className="text-xs text-gray-500">Auto-generated</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto text-xs font-mono">
            <pre>
              {`{
  "name": "ICU Staffing Trigger",
  "domain": "CLINICAL",
  "cooldownHours": 24,
  "condition": {
    "operator": "AND",
    "nodes": [
      {
        "feature": "icu_occupancy",
        "operator": ">",
        "value": 90,
        "duration": "2h"
      },
      {
        "feature": "health_score",
        "operator": "<",
        "value": 75
      }
    ]
  },
  "action": {
    "type": "CREATE_WORKFLOW",
    "template": "staffing_expansion"
  },
  "approvalPolicy": "policy_med_ops_maj"
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
