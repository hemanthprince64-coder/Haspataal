import Link from "next/link";
import Image from "next/image";

export default function ProfileCard({ patient, loading }) {
    const { name, phone, nickname, profilePhotoUrl } = patient || {};
    const displayName = nickname || name || 'Patient';
    const displayPhone = phone || '—';

    return (
        <div className="card-clinical p-6 relative overflow-hidden border-2 border-blue-50 shadow-md">
            <div className="relative flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 rounded-2xl border-2 border-blue-100 bg-white shadow-lg shrink-0 overflow-hidden">
                    {profilePhotoUrl ? (
                        <Image src={profilePhotoUrl} alt="Profile" width={80} height={80} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-black text-blue-600 bg-blue-50">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="flex-1 text-center md:text-left min-w-0 space-y-1">
                    <p className="text-blue-600 text-xs font-black uppercase tracking-[0.2em]">
                        {new Date().getHours() < 12 ? '☀️ Good Morning' : new Date().getHours() < 17 ? '🌤️ Good Afternoon' : '🌙 Good Evening'}, Welcome
                    </p>
                    <h1 className="text-3xl font-black text-[#0D2B55] tracking-tight truncate">{displayName}</h1>
                    <p className="text-slate-500 text-lg font-bold">{displayPhone}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <Link
                        href="/profile/edit"
                        className="bg-white text-blue-700 border-2 border-blue-100 px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all text-center"
                    >
                        ✏️ Edit Profile
                    </Link>
                    <Link
                        href="/profile/details"
                        className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all text-center shadow-md"
                    >
                        View Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
