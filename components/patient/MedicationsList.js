import { deleteMedicationAction } from '@/app/actions';

export default function MedicationsList({ medications }) {
    if (!medications || medications.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                <div className="text-4xl mb-3">💊</div>
                <p className="text-slate-500 text-sm">No medications recorded.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {medications.map((med) => (
                <div key={med.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-slate-800">{med.drugName}</h4>
                        <p className="text-sm text-slate-500">{med.dose} • {med.frequency}</p>
                        <p className="text-xs text-slate-400 mt-1">Start: {new Date(med.startDate).toLocaleDateString()}</p>
                    </div>
                    <form action={deleteMedicationAction}>
                        <input type="hidden" name="id" value={med.id} />
                        <button type="submit" className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors" aria-label="Delete">
                            ✕
                        </button>
                    </form>
                </div>
            ))}
        </div>
    );
}
