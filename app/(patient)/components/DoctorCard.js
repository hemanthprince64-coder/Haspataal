"use client";

import Link from "next/link";

export default function DoctorCard({ doctor }) {
    const { id, name, speciality, hospital, distance, fees, matches, stars, image } = doctor;

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-card transition-all duration-200 hover:shadow-hover hover:border-slate-300 mb-3">
            {/* Doctor Info Row */}
            <div className="flex gap-3.5 mb-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    <img
                        src={image}
                        alt={name}
                        className="w-[72px] h-[72px] rounded-2xl object-cover bg-slate-100"
                    />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold py-0.5 px-2 rounded-full border-2 border-white whitespace-nowrap">
                        {matches}% Match
                    </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-slate-900 mb-0.5 truncate">{name}</h3>
                    <p className="text-xs font-medium text-medical-600 mb-1.5 m-0">{speciality}</p>
                    <div className="flex items-center gap-1.5 text-[12px] text-slate-500 mb-1.5">
                        <span className="font-medium truncate">{hospital}</span>
                        <span className="text-slate-300">•</span>
                        <span className="whitespace-nowrap">📍 {distance}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-amber-600">⭐ {stars}</span>
                        <span className="text-[13px] font-bold text-emerald-600 bg-emerald-50 py-0.5 px-2 rounded-md">₹{fees}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5">
                <Link
                    href={`/doctor/${id}`}
                    className="flex-1 py-2.5 text-center rounded-xl text-[13px] font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-all duration-200 no-underline focus-ring"
                >
                    View Profile
                </Link>
                <Link
                    href={`/book/${id}`}
                    className="flex-1 py-2.5 text-center rounded-xl text-[13px] font-semibold text-white bg-medical-600 hover:bg-medical-700 shadow-soft hover:shadow-hover transition-all duration-200 no-underline focus-ring"
                >
                    Book Consult
                </Link>
            </div>
        </div>
    );
}
