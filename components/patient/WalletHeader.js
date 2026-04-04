import Link from "next/link";

export default function WalletHeader({ balance, onTopUp }) {
    return (
        <div className="bg-gradient-to-br from-[#0D2B55] to-blue-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            
            <h1 className="text-sm font-black uppercase tracking-[0.2em] opacity-70 mb-2">Haspataal Wallet</h1>
            <div className="text-5xl font-black tracking-tight mb-8">₹{balance}</div>
            
            <div className="flex gap-4">
                <button 
                    onClick={onTopUp}
                    className="bg-white text-blue-800 px-6 py-3 rounded-xl font-black shadow-lg hover:shadow-xl transition-all"
                >
                    + Top Up Wallet
                </button>
            </div>
        </div>
    );
}
