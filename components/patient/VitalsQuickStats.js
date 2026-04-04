export default function VitalsQuickStats({ latestVital }) {
    const stats = [
        { label: 'Weight', value: latestVital.weight || '—', unit: 'kg', icon: '⚖️', color: 'bg-blue-50 border-blue-200 text-blue-600' },
        { label: 'BP', value: latestVital.bloodPressure || '—', unit: '', icon: '🫀', color: 'bg-red-50 border-red-200 text-red-600' },
        { label: 'Sugar', value: latestVital.bloodSugar || '—', unit: 'mg/dL', icon: '🩸', color: 'bg-amber-50 border-amber-200 text-amber-600' },
        { label: 'SpO₂', value: latestVital.spo2 || '—', unit: '%', icon: '🫁', color: 'bg-teal-50 border-teal-200 text-teal-600' },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map(card => (
                <div key={card.label} className={`rounded-xl p-3 border text-center ${card.color}`}>
                    <div className="text-xl mb-1">{card.icon}</div>
                    <div className="text-lg font-bold">{card.value}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{card.label} {card.unit && `(${card.unit})`}</div>
                </div>
            ))}
        </div>
    );
}
