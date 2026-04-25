"use client";

import React from "react";
import { Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrescriptionData {
  hospital: {
    name: string;
    address?: string;
    phone?: string;
    logo?: string;
  };
  doctor: {
    name: string;
    qualification?: string;
    registration?: string;
  };
  patient: {
    name: string;
    age?: string | number;
    gender?: string;
    date: string;
  };
}

export function PrescriptionPad({ data }: { data: PrescriptionData }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 flex flex-col items-center">
      {/* UI Controls - Hidden on Print */}
      <div className="w-full max-w-[210mm] mb-6 flex justify-between items-center print:hidden">
        <Button 
          variant="ghost" 
          onClick={() => window.history.back()}
          className="text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <Button 
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print Prescription
        </Button>
      </div>

      {/* A4 Printable Sheet */}
      <div 
        className="bg-white shadow-2xl w-full max-w-[210mm] min-h-[297mm] p-[15mm] md:p-[20mm] flex flex-col border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0"
        id="prescription-sheet"
      >
        {/* 1. Header (Branding) */}
        <header className="text-center border-b-2 border-slate-900 pb-6 mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-2">
            {data.hospital.name}
          </h1>
          <div className="text-sm text-slate-600 space-y-0.5">
            <p>{data.hospital.address || "Hospital Address Not Configured"}</p>
            <p className="font-semibold text-slate-800">
              Ph: {data.hospital.phone || "N/A"}
            </p>
          </div>
        </header>

        {/* 2 & 3. Doctor & Patient Section */}
        <div className="flex justify-between items-start mb-12">
          {/* Doctor Info */}
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Dr. {data.doctor.name}</h2>
            <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">
              {data.doctor.qualification || "General Physician"}
            </p>
            <p className="text-xs text-slate-500">
              Reg No: <span className="font-mono">{data.doctor.registration || "N/A"}</span>
            </p>
          </div>

          {/* Patient Info */}
          <div className="text-right space-y-1.5 min-w-[200px]">
            <div className="flex justify-end gap-2 text-sm">
              <span className="text-slate-500">Date:</span>
              <span className="font-bold text-slate-900 border-b border-slate-300 px-2 min-w-[120px]">
                {data.patient.date}
              </span>
            </div>
            <div className="flex justify-end gap-2 text-sm">
              <span className="text-slate-500">Patient:</span>
              <span className="font-bold text-slate-900 border-b border-slate-300 px-2 min-w-[120px]">
                {data.patient.name}
              </span>
            </div>
            <div className="flex justify-end gap-2 text-sm">
              <span className="text-slate-500">Age / Sex:</span>
              <span className="font-bold text-slate-900 border-b border-slate-300 px-2 min-w-[120px]">
                {data.patient.age || "—"} / {data.patient.gender || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Prescription Area (Main Blank Space) */}
        <div className="flex-1 relative border-l border-slate-200 ml-2">
          <div className="absolute top-0 -left-6">
            <span className="text-4xl font-serif italic font-bold text-slate-900 select-none">
              Rx
            </span>
          </div>
          
          {/* Blank space for manual writing */}
          <div className="min-h-[450px] w-full" />
        </div>

        {/* 5. Advice Section */}
        <div className="mt-8 pt-8 border-t border-slate-100 space-y-6">
          <div className="flex items-end gap-3">
            <span className="text-sm font-bold text-slate-700 whitespace-nowrap">Advice:</span>
            <div className="flex-1 border-b border-dotted border-slate-400 h-6" />
          </div>
          <div className="flex items-end gap-3 w-1/2">
            <span className="text-sm font-bold text-slate-700 whitespace-nowrap">Follow-up:</span>
            <div className="flex-1 border-b border-dotted border-slate-400 h-6" />
          </div>
        </div>

        {/* 6. Signature Area */}
        <div className="mt-16 flex justify-end">
          <div className="text-center min-w-[200px]">
            <div className="border-t border-slate-900 mb-2" />
            <p className="text-xs font-bold text-slate-800 uppercase tracking-tighter">
              Doctor's Signature
            </p>
          </div>
        </div>

        {/* 7. Footer */}
        <footer className="mt-12 pt-4 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
            This prescription is valid for 30 days from the date of issue
          </p>
        </footer>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
          #prescription-sheet {
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
