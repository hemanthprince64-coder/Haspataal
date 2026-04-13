'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPatientFullProfile, addWalletTransactionAction } from "@/app/actions";
import WalletHeader from "@/components/patient/WalletHeader";
import TransactionHistory from "@/components/patient/TransactionHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Plus, CreditCard, Banknote, Landmark, Smartphone, History, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function WalletPage() {
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showTopUpOptions, setShowTopUpOptions] = useState(false);

    const loadData = () => {
        setLoading(true);
        getPatientFullProfile().then(data => {
            setPatient(data);
            setLoading(false);
        });
    };

    useEffect(() => {
        let active = true;
        getPatientFullProfile().then(data => {
            if (active) {
                setPatient(data);
                setLoading(false);
            }
        });
        return () => { active = false; };
    }, []);

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
        <main className="container max-w-4xl mx-auto px-6 py-10 animate-fade-in">
            <Button asChild variant="ghost" className="mb-8 text-slate-500 hover:text-blue-600 -ml-4 font-bold">
                <Link href="/profile" className="flex items-center gap-2">
                    <ChevronLeft className="w-5 h-5" /> Back to Profile
                </Link>
            </Button>
            
            <div className="mb-10">
                <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-emerald-700 bg-emerald-100/50 hover:bg-emerald-100 border-emerald-200 px-3 py-1 font-bold text-[10px] uppercase tracking-[0.2em] backdrop-blur-sm">
                        <PiggyBank className="w-3.5 h-3.5 mr-2" /> Digital Wallet
                    </Badge>
                </div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">My Balance</h1>
                <p className="text-slate-500 text-lg font-medium tracking-tight">Manage your credits and instant booking funds.</p>
            </div>

            <div className="space-y-8">
                {loading ? (
                    <Skeleton className="h-64 rounded-[2.5rem] bg-slate-100" />
                ) : (
                    <WalletHeader 
                        balance={balance} 
                        onTopUp={() => setShowTopUpOptions(!showTopUpOptions)} 
                    />
                )}

                {showTopUpOptions && (
                    <Card className="rounded-[2.5rem] border-none shadow-[0_32px_64px_-16px_rgba(37,99,235,0.1)] bg-white overflow-hidden animate-in slide-in-from-top-4 duration-500">
                        <CardHeader className="text-center bg-slate-50/50 border-b border-slate-100 p-8">
                            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Select Top-Up Amount</CardTitle>
                            <CardDescription className="text-slate-500 font-medium">Funds will be credited to your wallet instantly.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                                {[500, 1000, 2000, 5000].map(amt => (
                                    <button 
                                        key={amt}
                                        onClick={() => handleTopUp(amt)}
                                        className="group relative h-24 border-2 border-slate-100 hover:border-blue-500 hover:bg-white p-4 rounded-3xl text-center transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 active:scale-95"
                                    >
                                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 group-hover:text-blue-400 transition-colors">Amount</div>
                                        <div className="font-black text-2xl text-slate-700 group-hover:text-blue-600 group-hover:scale-110 transition-all">₹{amt}</div>
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Plus className="w-4 h-4 text-blue-400" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                            
                            <div className="flex flex-col items-center gap-6">
                                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-3 w-full">
                                    <div className="h-px flex-1 bg-slate-100" /> Authorized Payment Methods <div className="h-px flex-1 bg-slate-100" />
                                </div>
                                <div className="flex flex-wrap gap-3 justify-center">
                                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                                        <Smartphone className="w-4 h-4 text-blue-500" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">UPI / QR</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                                        <CreditCard className="w-4 h-4 text-indigo-500" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cards</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                                        <Landmark className="w-4 h-4 text-amber-500" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">NetBanking</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="rounded-[2.5rem] border-slate-200/60 shadow-xl shadow-slate-200/10 bg-white overflow-hidden">
                    <CardHeader className="p-8 border-b border-slate-100 bg-slate-50/30">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <History className="w-6 h-6 text-blue-600" />
                                <span className="uppercase tracking-[0.05em]">Transaction History</span>
                            </CardTitle>
                            <Badge variant="outline" className="text-slate-400 font-bold px-3 py-1 rounded-lg border-slate-200">
                                {transactions.length} Total
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-8 space-y-4">
                                {[1, 2, 3].map(i => (
                                    <Skeleton key={i} className="h-20 rounded-2xl bg-slate-50" />
                                ))}
                            </div>
                        ) : (
                            <TransactionHistory transactions={transactions} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
