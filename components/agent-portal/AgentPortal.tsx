import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, MapPin, CheckCircle2, Clock, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AgentPortal() {
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Partner & Agent Portal</h1>
          <p className="text-slate-500">Track your referrals, hospital activations, and commissions.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 h-12 px-6 gap-2 rounded-xl shadow-lg">
          <PlusCircle className="w-5 h-5" /> Refer New Hospital
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-8 mb-10">
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Commission Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-4xl font-black text-slate-900">₹1,45,000</h3>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-600">
               <CheckCircle2 className="w-4 h-4" /> ₹1,20,000 Payout Processed
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-4xl font-black text-blue-600">₹25,000</h3>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600">
               <Clock className="w-4 h-4" /> Scheduled for 1st May
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hospitals Referred</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-4xl font-black text-slate-900">12</h3>
            <p className="mt-4 text-sm text-slate-500">8 Activated • 4 In Verification</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xl border-0 bg-white">
        <CardHeader className="border-b px-8 py-6">
          <CardTitle className="text-xl font-bold">Referral Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-8 py-4">Hospital Name</th>
                  <th className="px-8 py-4">City</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Commission</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Lucknow City Hospital', city: 'Lucknow', status: 'Activated', comm: '₹15,000', color: 'text-emerald-600' },
                  { name: 'Kalyan Nursing Home', city: 'Kanpur', status: 'In Verification', comm: '₹5,000 (Est.)', color: 'text-amber-600' },
                  { name: 'Shiva Diagnostic Center', city: 'Lucknow', status: 'Activated', comm: '₹10,000', color: 'text-emerald-600' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 font-bold text-slate-800">{row.name}</td>
                    <td className="px-8 py-6 text-slate-500 flex items-center gap-2">
                       <MapPin className="w-3 h-3" /> {row.city}
                    </td>
                    <td className="px-8 py-6">
                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.status === 'Activated' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {row.status}
                       </span>
                    </td>
                    <td className={`px-8 py-6 font-bold ${row.color}`}>{row.comm}</td>
                    <td className="px-8 py-6 text-right">
                       <Button variant="ghost" className="text-blue-600 hover:bg-blue-50 font-bold">View Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
