import { format } from "date-fns";

export default function PrescriptionsList({ prescriptions }) {
    if (!prescriptions || prescriptions.length === 0) {
        return (
            <div className="border-2 border-dashed border-slate-200 p-12 text-center rounded-[2rem]">
                <div className="text-5xl opacity-50 mb-4 inline-block">📄</div>
                <h3 className="text-xl font-black text-[#0D2B55] mb-2">No prescriptions found</h3>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {prescriptions.map(pres => (
                <div key={pres.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center text-2xl ${pres.type === 'FILE' ? 'bg-amber-50' : 'bg-blue-50'} ${pres.type === 'FILE' ? 'text-amber-500' : 'text-blue-500'}`}>
                                {pres.type === 'FILE' ? '📎' : '💊'}
                            </div>
                            <div>
                                <h3 className="font-black text-[#0D2B55] text-lg">
                                    {pres.type === 'FILE' ? 'Uploaded Copy' : 'Clinical e-Prescription'}
                                </h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                                    {pres.createdAt ? format(new Date(pres.createdAt), "dd MMM yyyy") : 'N/A'}
                                </p>
                            </div>
                        </div>
                        <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-full ${pres.type === 'FILE' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                            {pres.type}
                        </span>
                    </div>

                    {pres.doctor && <p className="text-slate-600 font-bold text-sm mb-4 bg-slate-50 inline-block px-3 py-1.5 rounded-lg border border-slate-100">Prescribed by {pres.doctor.fullName}</p>}
                    {pres.notes && <p className="text-slate-600 italic text-sm p-4 bg-yellow-50 rounded-xl mb-4 border border-yellow-100">&quot;{pres.notes}&quot;</p>}

                    {pres.type === 'STRUCTURED' && pres.items && pres.items.length > 0 && (
                        <div className="space-y-2 mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0D2B55] opacity-50 mb-2">Medications</h4>
                            {pres.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2 border-b border-white last:border-0 last:pb-0">
                                    <div>
                                        <div className="font-black text-[#0D2B55]">{item.medicineName}</div>
                                        <div className="text-xs text-slate-500 font-medium mt-0.5">{item.instructions || 'Standard usage'}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-[#0D2B55]">{item.dosage}</div>
                                        <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-1 inline-block">{item.duration}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {pres.type === 'FILE' && pres.fileUrl && (
                        <a href={pres.fileUrl} target="_blank" rel="noopener noreferrer" className="block w-full text-center mt-4 bg-amber-50 hover:bg-amber-100 text-amber-700 font-black px-4 py-3 rounded-xl transition border border-amber-200">
                            👀 View Original Document
                        </a>
                    )}
                </div>
            ))}
        </div>
    );
}
