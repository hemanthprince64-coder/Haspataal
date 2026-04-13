import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit2, LayoutDashboard, Crown, Sparkles } from "lucide-react";

export default function ProfileCard({ patient }) {
    const { name, phone, nickname, profilePhotoUrl } = patient || {};
    const displayName = nickname || name || 'Patient';
    const displayPhone = phone || '—';

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return { text: 'Good Morning', icon: '☀️' };
        if (hour < 17) return { text: 'Good Afternoon', icon: '🌤️' };
        return { text: 'Good Evening', icon: '🌙' };
    };

    const greeting = getGreeting();

    return (
        <Card className="overflow-hidden border-slate-200 shadow-xl shadow-blue-900/5 rounded-[2rem] bg-white group transition-all duration-300">
            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-center gap-8 p-8 relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity group-hover:opacity-10 pointer-events-none">
                        <Sparkles className="w-32 h-32 text-blue-600" />
                    </div>
                    
                    <div className="relative">
                        <Avatar className="w-24 h-24 rounded-3xl border-4 border-white shadow-2xl ring-1 ring-blue-100/50 overflow-hidden">
                            <AvatarImage src={profilePhotoUrl} className="object-cover" />
                            <AvatarFallback className="text-3xl font-black text-blue-600 bg-blue-50">
                                {displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl p-1.5 shadow-lg shadow-amber-500/20 ring-2 ring-white">
                            <Crown className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left min-w-0 space-y-2">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-0 px-3 py-1 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5">
                                {greeting.icon} {greeting.text}
                            </Badge>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight truncate">
                            {displayName}
                        </h1>
                        <p className="text-slate-500 text-lg font-semibold flex items-center justify-center md:justify-start gap-1.5">
                            {displayPhone}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto pt-4 md:pt-0">
                        <Button asChild variant="outline" className="h-12 px-6 rounded-xl border-slate-200 font-bold text-slate-700 hover:bg-slate-50 gap-2 transition-all active:scale-95">
                            <Link href="/profile/edit">
                                <Edit2 className="w-4 h-4" /> Edit Profile
                            </Link>
                        </Button>
                        <Button asChild className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/20 gap-2 transition-all active:scale-95">
                            <Link href="/profile/details">
                                <LayoutDashboard className="w-4 h-4" /> View Dashboard
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

