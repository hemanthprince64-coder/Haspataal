'use client';

import { useEffect, useState } from "react";
import { getPatientFullProfile, addAddressAction, deleteAddressAction, setDefaultAddressAction } from "@/app/actions";
import Link from "next/link";
import { Home, Building2, MapPin, ChevronLeft, Plus, Trash2, CheckCircle2, Map, ShieldCheck, Info, Sparkles, Loader2, Navigation2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

export default function AddressesPage() {
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [message, setMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

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

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.target);
        const res = await addAddressAction(null, formData);
        setMessage(res.message);
        setIsSaving(false);
        if (res.success) {
            setShowAddForm(false);
            loadData();
        }
    };

    const handleDelete = async (addressId) => {
        const formData = new FormData();
        formData.append('addressId', addressId);
        await deleteAddressAction(null, formData);
        loadData();
    };

    const handleMakeDefault = async (addressId) => {
        const formData = new FormData();
        formData.append('addressId', addressId);
        await setDefaultAddressAction(null, formData);
        loadData();
    };

    const addresses = patient?.addresses || [];

    return (
        <main className="container max-w-4xl mx-auto px-6 py-10 animate-fade-in text-slate-900">
            <Button asChild variant="ghost" className="mb-8 text-slate-500 hover:text-blue-600 -ml-4 font-bold">
                <Link href="/profile" className="flex items-center gap-2">
                    <ChevronLeft className="w-5 h-5" /> Back to Profile
                </Link>
            </Button>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-blue-700 bg-blue-100/50 hover:bg-blue-100 border-blue-200 px-3 py-1 font-bold text-[10px] uppercase tracking-[0.2em] backdrop-blur-sm">
                            <Map className="w-3.5 h-3.5 mr-2" /> Address Book
                        </Badge>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight mb-2">Saved Locations</h1>
                    <p className="text-slate-500 text-lg font-medium tracking-tight">Manage your addresses for home visits and medicine deliveries.</p>
                </div>
                <Button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    size="lg" 
                    className={`${showAddForm ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-blue-600 hover:bg-blue-700 text-white'} h-16 px-8 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/10 transition-all active:scale-95`}
                >
                    {showAddForm ? 'Cancel' : <><Plus className="w-6 h-6 mr-3" /> Add Location</>}
                </Button>
            </div>

            {message && (
                <div className="mb-8 flex items-center gap-3 p-5 bg-blue-50 text-blue-700 border border-blue-100 rounded-2xl animate-in slide-in-from-top-2">
                    <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                    <p className="font-bold tracking-tight">{message}</p>
                </div>
            )}

            {showAddForm && (
                <Card className="mb-12 rounded-[2.5rem] border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden animate-in zoom-in-95 duration-500">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                        <CardTitle className="text-2xl font-black tracking-tight">Add New Address</CardTitle>
                        <CardDescription className="text-slate-500 font-medium tracking-tight">Used for sample collections and pharmacy logistics.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleFormSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location Type</Label>
                                    <Select name="type" defaultValue="Home">
                                        <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:ring-blue-500/20 focus-visible:ring-4 font-bold transition-all">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-200 shadow-xl">
                                            <SelectItem value="Home" className="font-bold py-3 rounded-xl">🏠 Home</SelectItem>
                                            <SelectItem value="Work" className="font-bold py-3 rounded-xl">🏢 Work</SelectItem>
                                            <SelectItem value="Other" className="font-bold py-3 rounded-xl">📍 Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</Label>
                                    <Input name="city" required placeholder="e.g. Mumbai" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:ring-blue-500/20 focus-visible:ring-4 font-bold transition-all" />
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Street Address</Label>
                                    <Textarea name="address" required placeholder="Flat, Building, Street Name" className="min-h-[100px] rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:ring-blue-500/20 focus-visible:ring-4 font-bold transition-all" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State</Label>
                                    <Input name="state" placeholder="e.g. Maharashtra" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:ring-blue-500/20 focus-visible:ring-4 font-bold transition-all" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pincode</Label>
                                    <Input name="pincode" required placeholder="e.g. 400001" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:ring-blue-500/20 focus-visible:ring-4 font-bold transition-all" />
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Landmark (Optional)</Label>
                                    <Input name="landmark" placeholder="e.g. Near Apollo Pharmacy" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:ring-blue-500/20 focus-visible:ring-4 font-bold transition-all" />
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 bg-slate-50 p-6 rounded-2xl border border-slate-100 group cursor-pointer">
                                <Checkbox name="isDefault" value="true" id="isDefault" className="h-6 w-6 rounded-lg data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                                <Label htmlFor="isDefault" className="font-black text-slate-700 cursor-pointer text-base">Set as Primary Recovery Address</Label>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isSaving ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Saving Location...</> : 'Register Address'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {loading ? (
                    [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 rounded-[2.5rem] bg-slate-100" />)
                ) : (
                    <>
                        {addresses.length === 0 && !showAddForm && (
                            <div className="col-span-full py-32 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200/60 animate-in fade-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/20">
                                    <Navigation2 className="w-10 h-10 text-slate-200" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No addresses found</h3>
                                <p className="text-slate-500 text-lg font-medium max-w-sm mx-auto leading-relaxed">
                                    Your personal address database is currently empty.
                                </p>
                            </div>
                        )}
                        {addresses.map(addr => (
                            <Card key={addr.id} className="group rounded-[2.5rem] border-slate-200/60 shadow-xl shadow-slate-200/5 bg-white overflow-hidden hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 relative">
                                {addr.isDefault && (
                                    <div className="absolute top-0 right-10">
                                        <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white font-black text-[9px] uppercase tracking-[0.2em] px-3 py-2 rounded-b-xl border-none shadow-lg">
                                            Primary
                                        </Badge>
                                    </div>
                                )}
                                
                                <CardContent className="p-8">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors duration-500">
                                            {addr.type === 'Home' ? <Home className="w-7 h-7 text-blue-600" /> : addr.type === 'Work' ? <Building2 className="w-7 h-7 text-indigo-600" /> : <MapPin className="w-7 h-7 text-slate-600" />}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-2xl tracking-tight group-hover:text-blue-600 transition-colors">{addr.type}</h3>
                                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Verified Location</div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 mb-8 ml-2">
                                        <p className="text-slate-600 font-bold leading-relaxed line-clamp-2">{addr.address}</p>
                                        {addr.landmark && (
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 w-fit">
                                                <Info className="w-3.5 h-3.5" /> Landmark: {addr.landmark}
                                            </div>
                                        )}
                                        <p className="text-slate-400 font-black text-[11px] uppercase tracking-widest flex items-center gap-2">
                                            {addr.city} • {addr.state} • {addr.pincode}
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                        {!addr.isDefault ? (
                                            <Button onClick={() => handleMakeDefault(addr.id)} variant="ghost" className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 rounded-xl">
                                                Set as Default
                                            </Button>
                                        ) : (
                                            <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-[0.2em] px-4">
                                                <ShieldCheck className="w-4 h-4" /> Active Selection
                                            </div>
                                        )}
                                        <Button onClick={() => handleDelete(addr.id)} variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </>
                )}
            </div>
        </main>
    );
}
