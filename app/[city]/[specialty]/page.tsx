import type { Metadata } from 'next';

// Dynamic params: /delhi/cardiologist, /mumbai/pediatrician etc.
interface DoctorPageProps {
    params: { city: string; specialty: string };
}

// Capitalise a slug for display e.g. "new-delhi" → "New Delhi"
function toTitle(slug: string) {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// SEO metadata — dynamically generated per city/specialty
export async function generateMetadata({ params }: DoctorPageProps): Promise<Metadata> {
    const city = toTitle(params.city);
    const specialty = toTitle(params.specialty);
    return {
        title: `Best ${specialty} in ${city} | Haspataal`,
        description: `Find top ${specialty} doctors in ${city}. Book appointments online instantly at Haspataal.`,
        openGraph: {
            title: `Best ${specialty} in ${city} | Haspataal`,
            description: `Find and book ${specialty} specialists in ${city} easily.`,
            type: 'website',
            url: `https://haspataal.com/${params.city}/${params.specialty}`,
        },
        twitter: {
            card: 'summary',
            title: `${specialty} in ${city} | Haspataal`,
        },
        alternates: {
            canonical: `https://haspataal.com/${params.city}/${params.specialty}`,
        },
    };
}

// Mock doctor data — in production fetched from api.haspataal.com via Prisma
function getMockDoctors(city: string, specialty: string) {
    return [
        { id: '1', name: `Dr. Ananya Sharma`, hospital: 'City Care Hospital', rating: 4.8, experience: 12, fee: 600 },
        { id: '2', name: `Dr. Rahul Menon`, hospital: 'Sunrise Medical Center', rating: 4.7, experience: 9, fee: 500 },
        { id: '3', name: `Dr. Meera Patel`, hospital: 'Apollo Clinic', rating: 4.9, experience: 15, fee: 800 },
    ].map((d) => ({ ...d, specialty: toTitle(specialty), city: toTitle(city) }));
}

export default function DoctorDiscoveryPage({ params }: DoctorPageProps) {
    const city = toTitle(params.city);
    const specialty = toTitle(params.specialty);
    const doctors = getMockDoctors(params.city, params.specialty);

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            {/* SEO Heading */}
            <h1 className="text-3xl font-bold text-white mb-2">
                Best <span className="text-cyan-400">{specialty}</span> in {city}
            </h1>
            <p className="text-gray-400 mb-8 text-sm">{doctors.length} doctors available — Book Instantly</p>

            {/* Doctor Cards */}
            <div className="flex flex-col gap-4">
                {doctors.map((doc) => (
                    <div key={doc.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center justify-between hover:border-cyan-500/30 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-xl font-bold shrink-0">
                                {doc.name.split(' ')[1][0]}
                            </div>
                            <div>
                                <h2 className="font-bold text-white">{doc.name}</h2>
                                <p className="text-xs text-gray-400">{doc.specialty} · {doc.experience} yrs exp</p>
                                <p className="text-xs text-gray-500">{doc.hospital}, {doc.city}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="text-yellow-400 text-xs">★ {doc.rating}</span>
                                    <span className="text-gray-600 text-xs">· Consultation ₹{doc.fee}</span>
                                </div>
                            </div>
                        </div>
                        <button className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm rounded-xl shrink-0 transition-colors">
                            Book Now
                        </button>
                    </div>
                ))}
            </div>

            {/* SEO Content Block */}
            <div className="mt-12 bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-2">
                    About {specialty} in {city}
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                    Haspataal connects patients in {city} with the best {specialty} specialists. Book a verified
                    doctor online with instant confirmation, real patient reviews, and transparent consultation fees.
                    All doctors on Haspataal are background-checked and credential-verified.
                </p>
            </div>
        </div>
    );
}
