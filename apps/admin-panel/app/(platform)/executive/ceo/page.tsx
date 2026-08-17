export default function CeoDashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">CEO Dashboard</h1>
        <p className="text-gray-500 mt-2">Network-wide Revenue, Growth, and Market intelligence.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Total Network Revenue</h3>
          <p className="text-4xl font-bold text-gray-900 mt-2">₹142.5M</p>
          <p className="text-green-600 text-sm mt-2 font-medium">↑ 12% vs last month</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Active Hospitals</h3>
          <p className="text-4xl font-bold text-gray-900 mt-2">84</p>
          <p className="text-green-600 text-sm mt-2 font-medium">↑ 3 new this week</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Customer Health Score</h3>
          <p className="text-4xl font-bold text-gray-900 mt-2">92/100</p>
          <p className="text-green-600 text-sm mt-2 font-medium">Top quartile SaaS benchmark</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8 min-h-[400px] flex items-center justify-center">
        <p className="text-gray-400">Semantic Report Builder Visualization Area (Revenue Trends)</p>
      </div>
    </div>
  );
}
