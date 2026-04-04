import Link from "next/link";

const clinicalSections = [
    { name: "Medical History", href: "/medical-history", icon: "🏥", desc: "Conditions & allergies" },
    { name: "Prescriptions", href: "/prescriptions", icon: "📄", desc: "Clinical & uploaded" },
    { name: "Medications", href: "/medications", icon: "💊", desc: "Current medicines" },
    { name: "Vitals Tracker", href: "/vitals", icon: "❤️", desc: "BP, weight, sugar" },
    { name: "Test Reports", href: "/records", icon: "📋", desc: "Lab results & scans" },
    { name: "Vaccinations", href: "/vaccinations", icon: "💉", desc: "Vaccine records" },
    { name: "Pregnancy Tracker", href: "/tracker", icon: "🤰", desc: "Maternal health" },
    { name: "Insurance", href: "/insurance", icon: "🛡️", desc: "Policy details" },
    { name: "MedChat AI", href: "/medchat", icon: "🤖", desc: "AI health assistant" },
];

export default function ClinicalServices() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {clinicalSections.map((s, i) => (
                <Link
                    key={s.href}
                    href={s.href}
                    className="card-clinical card-clinical-hover p-4 flex flex-row md:flex-col items-center md:items-start gap-4 no-underline group"
                >
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        {s.icon}
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="text-lg font-black text-[#0D2B55] group-hover:text-blue-600 transition-colors truncate">
                            {s.name}
                        </div>
                        <div className="text-xs text-slate-500 font-bold leading-tight truncate">{s.desc}</div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
