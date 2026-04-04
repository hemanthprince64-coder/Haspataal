export default function VaccinationsList({ vaccinations }) {
    if (!vaccinations || vaccinations.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                <div className="text-4xl mb-3">💉</div>
                <p className="text-slate-500 text-sm">No vaccination records.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {vaccinations.map((vaccine) => (
                <div key={vaccine.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-slate-800">{vaccine.vaccineName}</h4>
                        <p className="text-sm text-slate-500">Date Given: {new Date(vaccine.dateGiven).toLocaleDateString()}</p>
                        {vaccine.nextDueDate && (
                            <p className="text-xs text-teal-600 font-semibold mt-1">Next Due: {new Date(vaccine.nextDueDate).toLocaleDateString()}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
