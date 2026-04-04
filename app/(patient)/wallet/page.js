'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Skeleton } from 'boneyard-js/react';
import { getPatientFullProfile, addWalletTransactionAction } from "@/app/actions";
import WalletHeader from "@/components/patient/WalletHeader";
import TransactionHistory from "@/components/patient/TransactionHistory";

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

    const wallet = patient?.wallet || { balance: '0.00', transactions: [] };
    const balance = parseFloat(wallet.balance).toFixed(2);
    const transactions = wallet.transactions || [];

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
            <Link href="/profile" className="text-blue-600 font-bold mb-2 inline-block">← Back to Profile</Link>
            
            <Skeleton name="wallet-header" loading={loading}>
                <WalletHeader 
                    balance={balance} 
                    onTopUp={() => setShowTopUpOptions(!showTopUpOptions)} 
                />
            </Skeleton>

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
                
                <Skeleton name="transaction-history" loading={loading}>
                    <TransactionHistory transactions={transactions} />
                </Skeleton>
            </div>
        </div>
    );
}
