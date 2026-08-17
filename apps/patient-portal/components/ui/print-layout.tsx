'use client';

import { ReactNode } from 'react';

export function PrintLayout({
  children,
  hospitalName = 'Haspataal',
}: {
  children: ReactNode;
  hospitalName?: string;
}) {
  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-section,
          #print-section * {
            visibility: visible;
          }
          #print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
      <div id="print-section" className="print:p-8 bg-white print:text-black">
        <div className="hidden print:block text-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold">{hospitalName}</h1>
          <p className="text-sm text-slate-500">System Generated Document</p>
        </div>
        {children}
        <div className="hidden print:block text-center mt-12 pt-4 border-t text-xs text-slate-400">
          Printed on: {new Date().toLocaleString()}
        </div>
      </div>
    </>
  );
}
