"use client";

import { useEffect, useState } from "react";
import { BedDouble, User, Calendar } from "lucide-react";

interface BedRecord {
  id: string;
  bedNumber: string;
  type: string;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "UNDER_MAINTENANCE" | "CLEANING";
  patient?: { name: string; admittedAt: string; expectedDischargeAt?: string };
}

export default function WardsPage() {
  const [beds, setBeds] = useState<BedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    fetch("/api/hospital/ipd/beds")
      .then((r) => r.json())
      .then((data) => { setBeds(data.beds ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const statusColors: Record<string, string> = {
    AVAILABLE: "bg-green-100 text-green-700",
    OCCUPIED: "bg-blue-100 text-blue-700",
    RESERVED: "bg-yellow-100 text-yellow-700",
    UNDER_MAINTENANCE: "bg-red-100 text-red-700",
    CLEANING: "bg-purple-100 text-purple-700",
  };

  const filtered = filter === "ALL" ? beds : beds.filter((b) => b.status === filter);
  const occupiedCount = beds.filter((b) => b.status === "OCCUPIED").length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <BedDouble className="h-7 w-7 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IPD / Ward Management</h1>
          <p className="text-sm text-gray-500">
            {occupiedCount} of {beds.length} beds occupied
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {["ALL", "AVAILABLE", "OCCUPIED", "RESERVED", "UNDER_MAINTENANCE"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
              filter === s
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Bed grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-4 text-center text-gray-400 py-12">Loading beds...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-4 text-center text-gray-400 py-12">No beds found matching the filter.</div>
        ) : filtered.map((bed) => (
          <div
            key={bed.id}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-900 text-sm">{bed.bedNumber}</span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[bed.status]}`}>
                {bed.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-2">{bed.type}</p>
            {bed.patient && (
              <div className="border-t border-gray-100 pt-2 mt-2">
                <p className="text-xs font-medium text-gray-800 flex items-center gap-1">
                  <User className="h-3 w-3" /> {bed.patient.name}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3" />
                  Admitted: {new Date(bed.patient.admittedAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
