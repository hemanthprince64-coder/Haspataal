import { Plus, Wallet, Sparkles, TrendingUp, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WalletHeader({ balance, onTopUp }) {
    return (
        <div className="relative group perspective-1000">
            {/* Animated Glow Background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative h-64 bg-slate-900 rounded-[2.5rem] p-10 text-white overflow-hidden shadow-2xl transition-all duration-500 hover:scale-[1.01]">
                {/* Visual Textures */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
                
                {/* Floating Elements */}
                <div className="absolute right-[-50px] top-[-50px] w-64 h-64 bg-blue-600/30 rounded-full blur-[80px] group-hover:bg-indigo-600/40 transition-colors duration-700"></div>
                <div className="absolute left-[-20px] bottom-[-20px] w-40 h-40 bg-indigo-600/20 rounded-full blur-[60px]"></div>

                <div className="relative z-10 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-auto">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
                                <Wallet className="w-6 h-6 text-blue-300" />
                            </div>
                            <div>
                                <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Haspataal Premium</h1>
                                <div className="text-xs font-bold text-white/70">Verified Account</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Platinum
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div>
                            <div className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-300 mb-2">Available Balance</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black tracking-tighter tabular-nums drop-shadow-2xl">₹{balance}</span>
                                <div className="flex items-center gap-1 text-emerald-400 text-xs font-black uppercase mb-1.5">
                                    <TrendingUp className="w-3.5 h-3.5" /> Ready
                                </div>
                            </div>
                        </div>

                        <Button 
                            onClick={onTopUp}
                            className="bg-white hover:bg-slate-50 text-slate-900 h-16 px-8 rounded-2xl font-black text-base shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all hover:-translate-y-1 active:scale-95 group/btn"
                        >
                            <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" /> Top Up Wallet
                            <ArrowUpRight className="w-5 h-5 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
