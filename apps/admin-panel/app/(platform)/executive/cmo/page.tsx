export default function CmoDashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">CMO Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Clinical Quality, Capacity Forecasting, and Medical Operations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Capacity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Network Bed Occupancy</h3>
          <p className="text-3xl font-bold text-amber-600 mt-2">82%</p>
          <p className="text-amber-600 text-sm mt-2 font-medium">Predicted to hit 90% by Friday</p>
        </div>

        {/* Quality */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Readmission Rate (30d)</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">4.2%</p>
          <p className="text-green-600 text-sm mt-2 font-medium">↓ 0.5% vs last month</p>
        </div>

        {/* Operations */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Avg Length of Stay</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">3.8 Days</p>
          <p className="text-gray-500 text-sm mt-2 font-medium">Target: 3.5 Days</p>
        </div>

        {/* Safety */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Critical Medical Alerts</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">3</p>
          <p className="text-red-600 text-sm mt-2 font-medium">
            Action Required (Infection Protocol)
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8 min-h-[400px] flex items-center justify-center">
        <p className="text-gray-400">
          Semantic Report Builder Visualization Area (Clinical Outcomes & Infection Trends)
        </p>
      </div>
    </div>
  );
}
