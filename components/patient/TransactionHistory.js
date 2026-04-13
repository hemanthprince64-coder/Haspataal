import { format } from "date-fns";
import { ArrowDownCircle, ArrowUpCircle, History, Receipt, CreditCard, ShoppingBag, Banknote, AlertCircle, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TransactionHistory({ transactions }) {
    if (!transactions || transactions.length === 0) {
        return (
            <div className="py-24 text-center bg-slate-50/30">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/10 border border-slate-100 ring-1 ring-slate-100">
                    <History className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No Transactions Yet</h3>
                <p className="text-slate-500 text-lg font-medium max-w-sm mx-auto leading-relaxed">
                    Once you start using your wallet for bookings and services, your activity will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-slate-100">
            {transactions.map((txn, index) => {
                const isCredit = txn.type === 'CREDIT';
                const amntStr = parseFloat(txn.amount).toFixed(2);
                
                // Dynamic icons based on source
                let Icon = Receipt;
                if (txn.source?.includes('TOPUP')) Icon = Banknote;
                if (txn.source?.includes('BOOKING')) Icon = ShoppingBag;
                if (txn.source?.includes('REFUND')) Icon = CreditCard;
                
                return (
                    <div key={txn.id} className="flex justify-between items-center p-6 hover:bg-slate-50 transition-all group duration-300">
                        <div className="flex items-center gap-5">
                            <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${isCredit ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100' : 'bg-red-50 text-red-500 group-hover:bg-red-100'}`}>
                                <Icon className="w-7 h-7" />
                                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg border-2 border-white flex items-center justify-center shadow-md ${isCredit ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                    {isCredit ? <ArrowDownCircle className="w-4 h-4 text-white" /> : <ArrowUpCircle className="w-4 h-4 text-white" />}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-black text-slate-900 text-lg leading-tight tracking-tight capitalize group-hover:text-blue-600 transition-colors">
                                        {txn.source}
                                    </h4>
                                    <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0 border-none bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-400`}>
                                        {isCredit ? 'Credit' : 'Debit'}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {txn.createdAt ? format(new Date(txn.createdAt), "MMM d, yyyy") : 'N/A'}
                                    <span className="opacity-30">•</span>
                                    {txn.createdAt ? format(new Date(txn.createdAt), "hh:mm a") : 'N/A'}
                                </div>
                                {txn.description && (
                                    <div className="text-xs text-slate-500 mt-1 font-medium italic opacity-70 group-hover:opacity-100 transition-opacity">
                                        "{txn.description}"
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-2xl font-black tabular-nums tracking-tighter ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>
                                {isCredit ? '+' : '-'}₹{amntStr}
                            </div>
                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1 group-hover:text-emerald-500 transition-colors">
                                {isCredit ? 'Deposit' : 'Billed'}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    );
}
