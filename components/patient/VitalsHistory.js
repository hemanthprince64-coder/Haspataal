export default function VitalsHistory({ vitals }) {
    if (!vitals || vitals.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                <div className="text-4xl mb-3">📊</div>
                <p className="text-slate-500 text-sm">Your vitals history will appear here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {vitals.slice().reverse().map((vital) => (
                <div key={vital.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-400 border-b pb-2 mb-1">{new Date(vital.recordedAt).toLocaleString()}</span>
                    <div className="grid grid-cols-3 gap-2 text-sm text-slate-700">
                        {vital.weight && <div><b>Wt:</b> {vital.weight} kg</div>}
                        {vital.height && <div><b>Ht:</b> {vital.height} cm</div>}
                        {vital.bmi && <div><b>BMI:</b> {vital.bmi}</div>}
                        {vital.bloodPressure && <div><b>BP:</b> {vital.bloodPressure}</div>}
                        {vital.pulse && <div><b>Pulse:</b> {vital.pulse}</div>}
                        {vital.bloodSugar && <div><b>Sugar:</b> {vital.bloodSugar}</div>}
                        {vital.spo2 && <div><b>SpO₂:</b> {vital.spo2}%</div>}
                        {vital.temperature && <div><b>Temp:</b> {vital.temperature}°F</div>}
                    </div>
                </div>
            ))}
        </div>
    );
}
