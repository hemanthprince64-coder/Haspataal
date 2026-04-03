'use client';

import { useEffect, useState } from "react";
import { getPatientFullProfile, addWalletTransactionAction } from "@/app/actions";
import Link from "next/link";
import { format } from "date-fns";

export default function WalletPage() {
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showTopUpOptions, setShowTopUpOptions] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLoading(true);
        getPatientFullProfile().then(data => {
            setPatient(data);
            setLoading(false);
        });
    }

    const handleTopUp = async (amount) => {
        const formData = new FormData();
        formData.append('type', 'CREDIT');
        formData.append('amount', amount);
        formData.append('source', 'TOPUP');
        formData.append('description', 'Wallet Top-up via payment gateway');

        await addWalletTransactionAction(null, formData);
        setShowTopUpOptions(false);
        loadData();
    };

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse font-bold">Loading wallet...</div>;

    const wallet = patient?.wallet || { balance: '0.00', transactions: [] };
    const balance = parseFloat(wallet.balance).toFixed(2);
    const transactions = wallet.transactions || [];

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
            <Link href="/profile" className="text-blue-600 font-bold mb-2 inline-block">← Back to Profile</Link>
            
            <div className="bg-gradient-to-br from-[#0D2B55] to-blue-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                
                <h1 className="text-sm font-black uppercase tracking-[0.2em] opacity-70 mb-2">Haspataal Wallet</h1>
                <div className="text-5xl font-black tracking-tight mb-8">₹{balance}</div>
                
                <div className="flex gap-4">
                    <button 
                        onClick={() => setShowTopUpOptions(!showTopUpOptions)}
                        className="bg-white text-blue-800 px-6 py-3 rounded-xl font-black shadow-lg hover:shadow-xl transition-all"
                    >
                        + Top Up Wallet
                    </button>
                </div>
            </div>

            {showTopUpOptions && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-fade-in">
                    <h3 className="font-black text-xl text-[#0D2B55] mb-4 text-center">Select Top-Up Amount</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                        {[500, 1000, 2000, 5000].map(amt => (
                            <button 
                                key={amt}
                                onClick={() => handleTopUp(amt)}
                                className="border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 p-4 rounded-2xl text-center font-black text-xl text-slate-700 transition"
                            >
                                ₹{amt}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">UPI (GPay, PhonePe)</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">Debit / Credit Cards</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">NetBanking</span>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h2 className="font-black tracking-[0.1em] text-[#0D2B55] text-lg mb-6 uppercase">Transaction History</h2>
                
                {transactions.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 font-medium">No transactions yet.</div>
                ) : (
                    <div className="space-y-4">
                        {transactions.map(txn => {
                            const isCredit = txn.type === 'CREDIT';
                            const amntStr = parseFloat(txn.amount).toFixed(2);
                            return (
                                <div key={txn.id} className="flex justify-between items-center p-4 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${isCredit ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                            {isCredit ? '↓' : '↑'}
                                        </div>
                                        <div>
                                            <div className="font-black text-[#0D2B55] text-lg">{txn.source}</div>
                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{format(new Date(txn.createdAt), "MMM d, yyyy - hh:mm a")}</div>
                                            {txn.description && <div className="text-sm text-slate-600 mt-0.5">{txn.description}</div>}
                                        </div>
                                    </div>
                                    <div className={`text-xl font-black ${isCredit ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {isCredit ? '+' : '-'}₹{amntStr}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
