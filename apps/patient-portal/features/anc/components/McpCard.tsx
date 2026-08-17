/* eslint-disable */
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Printer, QrCode, Baby } from 'lucide-react';

interface McpCardData {
  pregnancyId: string;
  patientName: string;
  age?: number;
  address?: string;
  lmp?: string;
  edd?: string;
  gravida?: number;
  para?: number;
  bloodGroup?: string;
  rhFactor?: string;
  mcpCardNumber?: string;
  jsyEnrolled?: boolean;
  pmmvyEnrolled?: boolean;
  ashaName?: string;
  ashaPhone?: string;
  hospitalName?: string;
  hospitalPhone?: string;
}

interface McpCardProps {
  data: McpCardData;
}

export default function McpCard({ data }: McpCardProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-900">Mother & Child Protection Card</h3>
        <Button onClick={handlePrint} variant="outline" className="rounded-xl font-bold print:hidden">
          <Printer className="w-4 h-4 mr-2" /> Print MCP Card
        </Button>
      </div>

      {/* MCP Card Display */}
      <div className="mcp-card-print rounded-2xl border-2 border-pink-200 bg-white p-6 shadow-lg print:border-black print:shadow-none print:w-[80mm] print:rounded-none print:p-2">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 print:mb-2">
          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center print:hidden">
            <Baby className="w-6 h-6 text-pink-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-black text-slate-900 text-lg print:text-sm">MCP Card</h4>
            <p className="text-xs text-slate-500 print:text-[8px]">Ministry of Health &amp; Family Welfare, GOI</p>
          </div>
          {data.mcpCardNumber && (
            <Badge variant="secondary" className="print:text-[8px]">{data.mcpCardNumber}</Badge>
          )}
        </div>

        {/* Patient Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 print:gap-1 print:mb-2">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider print:text-[8px]">Name</p>
            <p className="font-bold text-slate-800 print:text-xs">{data.patientName || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider print:text-[8px]">Age</p>
            <p className="font-bold text-slate-800 print:text-xs">{data.age || '—'} years</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider print:text-[8px]">Blood Group</p>
            <p className="font-bold text-slate-800 print:text-xs">{data.bloodGroup || '—'} {data.rhFactor && `(${data.rhFactor})`}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider print:text-[8px]">Gravida / Para</p>
            <p className="font-bold text-slate-800 print:text-xs">G{data.gravida || 0}P{data.para || 0}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 mb-6 print:gap-1 print:mb-2">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider print:text-[8px]">LMP</p>
            <p className="font-bold text-slate-800 print:text-xs">{data.lmp ? new Date(data.lmp).toLocaleDateString() : '—'}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider print:text-[8px]">EDD</p>
            <p className="font-bold text-slate-800 print:text-xs">{data.edd ? new Date(data.edd).toLocaleDateString() : '—'}</p>
          </div>
        </div>

        {/* Schemes */}
        <div className="flex gap-2 mb-6 print:mb-2">
          {data.jsyEnrolled && (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 print:text-[8px]">JSY Enrolled</Badge>
          )}
          {data.pmmvyEnrolled && (
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 print:text-[8px]">PMMVY Enrolled</Badge>
          )}
        </div>

        {/* ASHA Contact */}
        <div className="mb-6 print:mb-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider print:text-[8px]">ASHA Worker</p>
          <p className="font-bold text-slate-800 print:text-xs">{data.ashaName || '—'} {data.ashaPhone && `| ${data.ashaPhone}`}</p>
        </div>

        {/* Hospital */}
        <div className="mb-6 print:mb-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider print:text-[8px]">Registered Hospital</p>
          <p className="font-bold text-slate-800 print:text-xs">{data.hospitalName || '—'} {data.hospitalPhone && `| ${data.hospitalPhone}`}</p>
        </div>

        {/* QR Code */}
        <div className="flex items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200 print:hidden">
          <div className="text-center">
            <QrCode className="w-16 h-16 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Scan for digital record</p>
          </div>
        </div>

        {/* Footer for print */}
        <div className="hidden print:block mt-4 pt-2 border-t border-black">
          <p className="text-[8px] text-slate-600 text-center">Issued by Govt. of India | Keep this card safe during pregnancy</p>
        </div>
      </div>

      {/* 80mm Thermal Print CSS */}
      <style jsx>{`
        @media print {
          .mcp-card-print {
            width: 80mm !important;
            max-width: 80mm !important;
            padding: 8mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: 1px solid #000 !important;
            border-radius: 0 !important;
            font-size: 10px !important;
          }
          .mcp-card-print * {
            font-size: 10px !important;
          }
        }
      `}</style>
    </div>
  );
}
