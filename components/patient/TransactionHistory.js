import { format } from "date-fns";

export default function TransactionHistory({ transactions }) {
    if (!transactions || transactions.length === 0) {
        return <div className="text-center py-8 text-slate-500 font-medium">No transactions yet.</div>;
    }

    return (
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
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    {txn.createdAt ? format(new Date(txn.createdAt), "MMM d, yyyy - hh:mm a") : 'N/A'}
                                </div>
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
    );
}
