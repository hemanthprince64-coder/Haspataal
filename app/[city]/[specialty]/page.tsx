import type { Metadata } from 'next';
import { services } from '@/lib/services';
import { notFound } from 'next/navigation';
import HubEmptyState from '@/app/components/HubEmptyState';

interface DoctorPageProps {
    params: { city: string; specialty: string };
}

function toTitle(slug: string) {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({ params }: DoctorPageProps): Promise<Metadata> {
    const city = toTitle(params.city);
    const specialty = toTitle(params.specialty);
    
    // Fetch count for metadata accuracy
    const stats = await services.platform.getHubStats(params.city, params.specialty);
    
    return {
        title: `Best ${specialty} in ${city} | ${stats.count} Doctors Found | Haspataal`,
        description: `Find top ${specialty} doctors in ${city}. ${stats.count} specialists available for instant online booking at Haspataal.`,
        openGraph: {
            title: `Best ${specialty} in ${city} | Haspataal`,
            description: `Connect with ${stats.count} ${specialty} specialists in ${city} easily.`,
            type: 'website',
            url: `https://haspataal.com/${params.city}/${params.specialty}`,
        },
    };
}

export default async function DoctorDiscoveryPage({ params }: DoctorPageProps) {
    const city = toTitle(params.city);
    const specialty = toTitle(params.specialty);
    
    // Fetch real data from Prisma via services
    const doctors = await services.platform.getDoctorsByHub(params.city, params.specialty);

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            {/* SEO Heading */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Best <span className="text-cyan-400">{specialty}</span> in {city}
                </h1>
                <p className="text-gray-400 text-sm">
                    {doctors.length > 0 
                        ? `${doctors.length} verified specialists available — Book Instantly`
                        : `No specialists found in ${city} for ${specialty} yet. Try nearby cities.`}
                </p>
            </div>

            {/* Doctor Cards */}
            <div className="flex flex-col gap-4">
                {doctors.length > 0 ? (
                    doctors.map((doc) => (
                        <div key={doc.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center justify-between hover:border-cyan-500/30 transition-shadow transition-all hover:scale-[1.01]">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-2xl font-bold text-cyan-400 shrink-0">
                                    {doc.fullName ? doc.fullName.split(' ').pop()?.[0] : '?'}
                                </div>
                                <div>
                                    <h2 className="font-bold text-white text-lg">{doc.fullName}</h2>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        <span className="text-xs px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full font-medium">
                                            {specialty}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full font-medium">
                                            Verified
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {doc.affiliations?.[0]?.hospital?.legalName || 'Private Practice'}, {city}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 text-right">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Consultation</p>
                                    <p className="text-white font-bold inline-flex items-center">₹500 <span className="ml-1 text-[10px] text-gray-600 font-normal">(Instant)</span></p>
                                </div>
                                <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs uppercase rounded-xl transition-all shadow-lg shadow-cyan-500/30">
                                    Book Now
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <HubEmptyState city={city} specialty={specialty} />
                )}
            </div>

            {/* SEO Content Block */}
            <div className="mt-16 bg-gray-900/30 border border-gray-800/50 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-white mb-4">
                    Reliable {specialty} Consultation in {city}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-400 text-sm leading-relaxed">
                    <p>
                        Searching for the best {specialty} in {city}? Haspataal simplifies your search by providing 
                        a curated list of top-rated and verified specialists. Whether you&apos;re looking for a 
                        routine check-up or specialized care, our platform ensures you connect with the 
                        right healthcare professional instantly.
                    </p>
                    <p>
                        Our partner hospitals in {city} are equipped with state-of-the-art facilities. 
                        By booking through Haspataal, you get priority access, verified reviews from 
                        real patients, and the convenience of managing your appointments digitally.
                    </p>
                </div>
            </div>
        </div>
    );
}
