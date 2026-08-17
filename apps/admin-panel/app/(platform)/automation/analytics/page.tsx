'use client';
import React from 'react';

export default function AutomationAnalyticsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Automation Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Governance efficiency and automation performance metrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Governance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Avg Approval Time</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">1.4h</p>
          <p className="text-green-600 text-sm mt-2 font-medium">↓ 15m vs last month</p>
        </div>

        {/* Automation */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Autonomous Resolution %</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">68%</p>
          <p className="text-blue-600 text-sm mt-2 font-medium">Of governed workflows</p>
        </div>

        {/* Reliability */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Human Override Rate</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">12%</p>
          <p className="text-gray-500 text-sm mt-2 font-medium">Rejections & Cancelations</p>
        </div>

        {/* Escalations */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Escalation Rate</h3>
          <p className="text-3xl font-bold text-amber-600 mt-2">4.2%</p>
          <p className="text-amber-600 text-sm mt-2 font-medium">Due to timeouts</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 min-h-[300px] flex items-center justify-center">
        <p className="text-gray-400">
          Semantic Report Builder Visualization Area (Rule Performance & Approval Times)
        </p>
      </div>
    </div>
  );
}
