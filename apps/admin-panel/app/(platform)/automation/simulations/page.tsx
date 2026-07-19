'use client';
import React from 'react';

export default function SimulationLabPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Simulation Lab</h1>
          <p className="text-sm text-gray-500 mt-1">
            Replay draft rules against historical platform data.
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">Simulation Parameters</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Target Rule</label>
            <select className="w-full border-gray-300 rounded-lg text-sm">
              <option>ICU Staffing Trigger (Draft v1.0)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Timeframe (Replay)
            </label>
            <select className="w-full border-gray-300 rounded-lg text-sm">
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>Last 12 Months</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Target Network</label>
            <select className="w-full border-gray-300 rounded-lg text-sm">
              <option>All Hospitals</option>
              <option>Apollo Region 1</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm">
            ▶ Run Simulation
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-gray-50/50">
          <h2 className="font-semibold text-gray-900">Simulation Results</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-xs font-medium text-gray-500 uppercase">Simulated Triggers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">14</p>
              <p className="text-xs text-green-600 mt-1">Safe volume</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-xs font-medium text-gray-500 uppercase">Est. Approvals Required</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">14</p>
              <p className="text-xs text-gray-500 mt-1">MAJORITY strategy</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-xs font-medium text-gray-500 uppercase">Automation Storm Risk</p>
              <p className="text-2xl font-bold text-green-600 mt-1">LOW</p>
              <p className="text-xs text-gray-500 mt-1">Due to 24h cooldown</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-xs font-medium text-gray-500 uppercase">Peak Frequency</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">3/day</p>
              <p className="text-xs text-gray-500 mt-1">On Nov 12th</p>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Simulated Date
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Trigger Condition
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Proposed Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">Nov 12, 2026 14:30</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">Hospital (h-102)</td>
                  <td className="px-6 py-4">ICU Occupancy (92%) &gt; 90% for 2h</td>
                  <td className="px-6 py-4 font-mono text-xs text-blue-600">CREATE_WORKFLOW</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">Nov 10, 2026 09:15</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">Hospital (h-401)</td>
                  <td className="px-6 py-4">ICU Occupancy (95%) &gt; 90% for 2h</td>
                  <td className="px-6 py-4 font-mono text-xs text-blue-600">CREATE_WORKFLOW</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
