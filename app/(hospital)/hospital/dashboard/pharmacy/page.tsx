"use client";

import { useEffect, useState } from "react";
import { Pill, Search, AlertTriangle, TrendingDown, PackageCheck } from "lucide-react";

interface DrugStock {
  id: string;
  name: string;
  stock: number;
  minLevel: number;
  expiryDate: string;
  category: string;
}

export default function PharmacyPage() {
  const [drugs, setDrugs] = useState<DrugStock[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hospital/pharmacy/stock")
      .then((r) => r.json())
      .then((data) => {
        setDrugs(data.drugs ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = drugs.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );
  const lowStock = drugs.filter((d) => d.stock <= d.minLevel);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Pill className="h-7 w-7 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pharmacy</h1>
            <p className="text-sm text-gray-500">Inventory & dispensing management</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
          + Add Stock
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <PackageCheck className="h-4 w-4" /> Total SKUs
          </div>
          <div className="text-2xl font-bold text-gray-900">{drugs.length}</div>
        </div>
        <div className="bg-white border border-red-100 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-500 text-xs mb-1">
            <AlertTriangle className="h-4 w-4" /> Low Stock
          </div>
          <div className="text-2xl font-bold text-red-600">{lowStock.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <TrendingDown className="h-4 w-4" /> Expiring Soon
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {drugs.filter((d) => {
              const days = Math.ceil(
                (new Date(d.expiryDate).getTime() - Date.now()) / 86400000
              );
              return days <= 30 && days > 0;
            }).length}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search drugs..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Drug Name", "Category", "Stock", "Min Level", "Expiry", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                  Loading inventory...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                  No drugs found.
                </td>
              </tr>
            ) : (
              filtered.map((drug) => {
                const isLow = drug.stock <= drug.minLevel;
                return (
                  <tr key={drug.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{drug.name}</td>
                    <td className="px-4 py-3 text-gray-600">{drug.category}</td>
                    <td className="px-4 py-3 text-gray-900">{drug.stock}</td>
                    <td className="px-4 py-3 text-gray-500">{drug.minLevel}</td>
                    <td className="px-4 py-3 text-gray-600">{drug.expiryDate}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          isLow
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {isLow ? "Low Stock" : "OK"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
