export default function CooDashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">COO Dashboard</h1>
        <p className="text-gray-500 mt-2">Operations, SLAs, Workflows, and Incident monitoring.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Platform SLA Compliance</h3>
          <p className="text-4xl font-bold text-gray-900 mt-2">99.8%</p>
          <p className="text-gray-500 text-sm mt-2 font-medium">Target: 99.5%</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Active Incidents</h3>
          <p className="text-4xl font-bold text-amber-600 mt-2">12</p>
          <p className="text-amber-600 text-sm mt-2 font-medium">2 Critical, 10 Warning</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Avg Resolution Time</h3>
          <p className="text-4xl font-bold text-gray-900 mt-2">14m</p>
          <p className="text-green-600 text-sm mt-2 font-medium">↓ 5m vs last month</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8 min-h-[400px] flex items-center justify-center">
        <p className="text-gray-400">
          Semantic Report Builder Visualization Area (Workflow Bottlenecks)
        </p>
      </div>
    </div>
  );
}
