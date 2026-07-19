'use client';
import React, { useState } from 'react';

export default function AIAuthoringHubPage() {
  const [activeTab, setActiveTab] = useState('Generate');

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AI Authoring Hub</h1>
          <p className="text-sm text-gray-500 mt-1">
            Generative assistant for platform engineering and configuration.
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm flex flex-col h-[calc(100vh-14rem)]">
        {/* Workspace Navigation */}
        <div className="border-b px-6 flex gap-6 bg-gray-50 rounded-t-xl">
          {['Generate', 'Transform', 'Explain', 'Optimize', 'Migrate'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-8 flex-1 overflow-y-auto">
          {activeTab === 'Generate' && (
            <div className="max-w-3xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Generate New Artifact</h2>
              <p className="text-sm text-gray-500 mb-6">
                Describe the rule, workflow, policy, or report you want to create.
              </p>

              <div className="space-y-4">
                <textarea
                  className="w-full h-32 border border-gray-300 rounded-lg p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  placeholder="e.g., Create a decision rule that triggers an alert when the triage queue exceeds 20 patients for more than 30 minutes, requiring Operations Manager approval."
                ></textarea>

                <div className="flex justify-between items-center bg-gray-50 p-4 border rounded-lg">
                  <div className="flex gap-4 items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      Context Sources:
                    </span>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                      Knowledge Graph
                    </span>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                      Capability Registry
                    </span>
                  </div>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm">
                    ✨ Generate AST
                  </button>
                </div>
              </div>

              <div className="mt-8 border rounded-lg p-6 bg-gray-50/50">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Authoring Pipeline State
                </h3>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold border border-blue-200">
                    1
                  </div>
                  <span className="text-sm text-blue-700 font-medium">Pending Input</span>
                  <div className="h-0.5 w-8 bg-gray-200"></div>
                  <div className="h-6 w-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold border border-gray-300">
                    2
                  </div>
                  <span className="text-sm text-gray-500">AST Validation</span>
                  <div className="h-0.5 w-8 bg-gray-200"></div>
                  <div className="h-6 w-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold border border-gray-300">
                    3
                  </div>
                  <span className="text-sm text-gray-500">Static Analysis</span>
                  <div className="h-0.5 w-8 bg-gray-200"></div>
                  <div className="h-6 w-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold border border-gray-300">
                    4
                  </div>
                  <span className="text-sm text-gray-500">Simulation Draft</span>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'Generate' && (
            <div className="flex items-center justify-center h-full text-gray-400">
              {activeTab} Workspace (Coming Soon)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
