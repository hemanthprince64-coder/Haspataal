'use client';
import React from 'react';

export default function AutomationDashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Automation Telemetry</h1>
        <p className="text-sm text-gray-500 mt-1">
          Live metrics across the Haspataal Adaptive Operations Platform.
        </p>
      </div>

      {/* Platform Health */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
          Platform Health
        </h2>
        <div className="grid grid-cols-4 gap-4">
          <MetricCard title="Automation Rate" value="68.4%" change="+2.1%" />
          <MetricCard title="Running Executions" value="142" change="-5" />
          <MetricCard title="Pending Approvals" value="18" change="+3" />
          <MetricCard title="Avg Rule Health" value="92.1" change="+0.4" isWarning={false} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Operational Health */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Operational Health
          </h2>
          <div className="bg-white border rounded-xl shadow-sm p-4">
            <ul className="divide-y text-sm">
              <li className="py-3 flex justify-between">
                <span className="text-gray-600">Active Incidents</span>
                <span className="font-semibold text-red-600">2</span>
              </li>
              <li className="py-3 flex justify-between">
                <span className="text-gray-600">Failed Executions (24h)</span>
                <span className="font-semibold text-gray-900">4</span>
              </li>
              <li className="py-3 flex justify-between">
                <span className="text-gray-600">Workflow Queue Depth</span>
                <span className="font-semibold text-gray-900">Normal</span>
              </li>
              <li className="py-3 flex justify-between">
                <span className="text-gray-600">Circuit Breakers Tripped</span>
                <span className="font-semibold text-green-600">0</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Optimization */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Optimization
          </h2>
          <div className="bg-white border rounded-xl shadow-sm p-4">
            <ul className="divide-y text-sm">
              <li className="py-3 flex justify-between items-center">
                <span className="text-gray-600">Rules Recommended for Review</span>
                <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded-full">
                  3 Rules
                </span>
              </li>
              <li className="py-3 flex justify-between items-center">
                <span className="text-gray-600">Highest Override Rate</span>
                <span className="text-gray-900">Staffing Escalation (41%)</span>
              </li>
              <li className="py-3 flex justify-between items-center">
                <span className="text-gray-600">Lowest Confidence Rules</span>
                <span className="text-gray-900">Inventory Reorder</span>
              </li>
              <li className="py-3 flex justify-between items-center">
                <span className="text-gray-600">Recently Optimized</span>
                <span className="text-green-600 font-medium">12 Rules</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Business Impact */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
          Business Impact (30 Days)
        </h2>
        <div className="grid grid-cols-4 gap-4">
          <MetricCard title="Hours Saved" value="1,420" change="+12%" />
          <MetricCard title="Manual Work Eliminated" value="8.4M" change="+5%" />
          <MetricCard title="Approval Throughput" value="1.2s" change="-0.4s" />
          <MetricCard title="Est. Cost Savings" value="$84k" change="+8%" />
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  isWarning = false,
}: {
  title: string;
  value: string;
  change: string;
  isWarning?: boolean;
}) {
  const isPositive = change.startsWith('+') || change.startsWith('-0.'); // simple heuristic for UI

  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold ${isWarning ? 'text-orange-600' : 'text-gray-900'}`}>
          {value}
        </span>
        <span className={`text-xs font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      </div>
    </div>
  );
}
