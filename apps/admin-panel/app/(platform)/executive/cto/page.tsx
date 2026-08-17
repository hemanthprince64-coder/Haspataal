export default function CtoDashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">CTO Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Infrastructure, Latency, Queues, Security, and AI operations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase">P99 API Latency</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">124ms</p>
          <p className="text-green-600 text-sm mt-2 font-medium">Healthy</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Event Queue Depth</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          <p className="text-green-600 text-sm mt-2 font-medium">No lag detected</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase">AI Ops Actions</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">142</p>
          <p className="text-gray-500 text-sm mt-2 font-medium">Last 24 hours</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase">AI Token Cost</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">$14.20</p>
          <p className="text-gray-500 text-sm mt-2 font-medium">Within limits</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8 min-h-[400px] flex items-center justify-center">
        <p className="text-gray-400">
          Semantic Report Builder Visualization Area (Infrastructure Health)
        </p>
      </div>
    </div>
  );
}
