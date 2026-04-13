'use client';

import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
    User, Home, PhoneCall, ShieldCheck, Heart, 
    Plus, Trash2, ChevronLeft, Save, Loader2,
    Users, Calendar, Droplets, Baby, UserPlus, X,
    Sparkles
} from 'lucide-react';
import { 
    updatePatientProfile, 
    addFamilyMemberAction, 
    deleteFamilyMemberAction, 
    getPatientFullProfile 
} from '@/app/actions';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SimpleAccordion as Accordion } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const initialState = { message: '', success: false };

function FormField({ label, name, type = 'text', defaultValue, required, placeholder, options }) {
    return (
        <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                {label}{required && <span className="text-rose-500 ml-1">*</span>}
            </Label>
            {options ? (
                <div className="relative group">
                    <select 
                        name={name} 
                        defaultValue={defaultValue || ''} 
                        className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none transition-all hover:border-blue-200"
                    >
                        <option value="">Select Option</option>
                        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
                        <Heart className="w-4 h-4" />
                    </div>
                </div>
            ) : (
                <Input
                    name={name}
                    type={type}
                    defaultValue={type === 'date' && defaultValue ? new Date(defaultValue).toISOString().split('T')[0] : (defaultValue || '')}
                    required={required}
                    placeholder={placeholder}
                    className="h-12 rounded-xl border-slate-200 focus:ring-blue-600 transition-all hover:border-blue-200 font-medium"
                />
            )}
        </div>
    );
}

export default function EditProfile() {
    const [state, formAction, isPending] = useActionState(updatePatientProfile, initialState);
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPatientFullProfile().then(data => {
            setPatient(data);
            setLoading(false);
        });
    }, []);

    const [openSections, setOpenSections] = useState({ identity: true, demographics: false, emergency: false, preferences: false });

    const toggleSection = (key) => {
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (loading) {
        return (
            <div className="container max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
                <p className="text-slate-400 font-medium animate-pulse">Syncing your medical data...</p>
            </div>
        );
    }

    const p = patient || {};

    if (state?.success) {
        return (
            <div className="container max-w-lg mx-auto px-4 py-12 animate-fade-in text-center">
                <Card className="border-emerald-100 shadow-2xl shadow-emerald-500/10 rounded-[2.5rem] bg-white p-10 space-y-6">
                    <div className="w-20 h-20 mx-auto bg-emerald-50 rounded-full flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20" />
                        <ShieldCheck className="w-10 h-10 text-emerald-600" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-slate-900">Information Verified</h2>
                        <p className="text-slate-500 font-medium">{state.message}</p>
                    </div>
                    <Button asChild className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-500/20">
                        <Link href="/profile">
                            <ChevronLeft className="w-4 h-4 mr-2" /> Back to Records
                        </Link>
                    </Button>
                </Card>
            </div>
        );
    }

    const genderOptions = [{ value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }, { value: 'O', label: 'Other' }];
    const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(v => ({ value: v, label: v }));
    const maritalOptions = [
        { value: 'Single', label: 'Single' }, { value: 'Married', label: 'Married' },
        { value: 'Divorced', label: 'Divorced' }, { value: 'Widowed', label: 'Widowed' }
    ];

    return (
        <div className="container max-w-2xl mx-auto px-4 py-8 animate-fade-in space-y-8 pb-32">
            <div className="flex items-center justify-between">
                <Button asChild variant="ghost" className="text-slate-500 hover:text-blue-600 font-bold px-0 gap-2">
                    <Link href="/profile">
                        <ChevronLeft className="w-5 h-5" /> All Details
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">Modify Profile</h1>
                </div>
            </div>

            <form action={formAction} className="space-y-4">
                <Accordion title="Identity & Biometrics" icon={<User className="w-4 h-4" />} isOpen={openSections.identity} onToggle={() => toggleSection('identity')}>
                    <div className="space-y-6">
                        <div className="flex items-center gap-6 pb-2">
                            <Avatar className="w-20 h-20 rounded-3xl border-4 border-slate-50 shadow-md ring-1 ring-slate-100">
                                <AvatarImage src={p.profilePhotoUrl} className="object-cover" />
                                <AvatarFallback className="text-2xl font-black text-blue-600 bg-blue-50">
                                    {(p.name || 'P').charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Photo</Label>
                                <Input type="file" name="profilePhotoFile" accept="image/*" className="h-10 text-xs p-1.5 cursor-pointer file:font-black file:text-[10px] file:uppercase file:bg-blue-50 file:rounded-lg file:border-0 hover:file:bg-blue-100" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField label="Full Legal Name" name="name" defaultValue={p.name} required placeholder="John Doe" />
                            <FormField label="Preferred Name" name="nickname" defaultValue={p.nickname} placeholder="Nickname" />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField label="Date of Birth" name="dob" type="date" defaultValue={p.dob} required />
                            <FormField label="Assign Gender" name="gender" defaultValue={p.gender} options={genderOptions} />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField label="Blood Group" name="bloodGroup" defaultValue={p.bloodGroup} options={bloodGroupOptions} />
                            <FormField label="Safe Email" name="email" type="email" defaultValue={p.email} placeholder="your@health.com" />
                        </div>
                    </div>
                </Accordion>

                <Accordion title="Demographics & Address" icon={<Home className="w-4 h-4" />} isOpen={openSections.demographics} onToggle={() => toggleSection('demographics')}>
                    <div className="space-y-6">
                        <FormField label="Residential Address" name="address" defaultValue={p.address} placeholder="Street, Landmark" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField label="City" name="city" defaultValue={p.city} placeholder="City" />
                            <FormField label="State" name="state" defaultValue={p.state} placeholder="State" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField label="PIN Code" name="pincode" defaultValue={p.pincode} placeholder="110001" />
                            <FormField label="Marital Status" name="maritalStatus" defaultValue={p.maritalStatus} options={maritalOptions} />
                        </div>
                    </div>
                </Accordion>

                <Accordion title="Emergency Network" icon={<PhoneCall className="w-4 h-4" />} isOpen={openSections.emergency} onToggle={() => toggleSection('emergency')}>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField label="Contact Person" name="emergencyContactName" defaultValue={p.emergencyContactName} placeholder="Guardian Name" />
                            <FormField label="Relationship" name="emergencyContactRelation" defaultValue={p.emergencyContactRelation} placeholder="e.g. Spouse" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField label="Emergency Phone" name="emergencyContactPhone" defaultValue={p.emergencyContactPhone} placeholder="+91..." />
                            <FormField label="Secondary Phone" name="emergencyContactAltPhone" defaultValue={p.emergencyContactAltPhone} />
                        </div>
                    </div>
                </Accordion>

                <Accordion title="Care Preferences" icon={<ShieldCheck className="w-4 h-4" />} isOpen={openSections.preferences} onToggle={() => toggleSection('preferences')}>
                    <div className="space-y-6">
                        <FormField label="Preferred Medical Facility" name="preferredHospital" defaultValue={p.preferredHospital} placeholder="e.g. AIIMS" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField label="Care Speciality" name="preferredSpeciality" defaultValue={p.preferredSpeciality} placeholder="e.g. Cardiology" />
                            <FormField label="Regular Consultant" name="preferredDoctor" defaultValue={p.preferredDoctor} placeholder="Dr. Name" />
                        </div>
                    </div>
                </Accordion>

                {state?.message && !state.success && (
                    <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold animate-in zoom-in-95">
                        <ShieldCheck className="w-5 h-5 shrink-0" /> {state.message}
                    </div>
                )}

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 z-10 md:static md:bg-transparent md:border-0 md:p-0 pt-6">
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full h-14 md:h-12 rounded-[1.25rem] md:rounded-xl font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 gap-3 active:scale-95 transition-all text-sm uppercase tracking-widest"
                    >
                        {isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Digitizing Changes...</> : <><Save className="w-5 h-5" /> Secure & Update Profile</>}
                    </Button>
                </div>
            </form>

            <section className="pt-8 border-t border-slate-100 space-y-6 pb-20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <Users className="w-4 h-4" />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest text-xs">Family Network</h2>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Link family members to your master ID for unified care.</p>
                </div>

                <FamilyMemberForm members={p.familyMembers || []} />
            </section>
        </div>
    );
}

function FamilyMemberForm({ members }) {
    const [addState, addAction, isAdding] = useActionState(addFamilyMemberAction, initialState);
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="space-y-4">
            {members?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {members.map(m => (
                        <Card key={m.id} className="border-slate-100 shadow-sm rounded-2xl overflow-hidden group hover:border-blue-200 transition-all">
                            <CardContent className="p-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0">
                                        {m.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-sm text-slate-900 truncate">{m.name}</h4>
                                        <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest border-slate-100 text-slate-400 px-1.5 py-0 h-4">
                                            {m.relation}
                                        </Badge>
                                    </div>
                                </div>
                                <form action={deleteFamilyMemberAction}>
                                    <input type="hidden" name="id" value={m.id} />
                                    <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {addState?.success && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold animate-in slide-in-from-top-2">
                    ✓ {addState.message}
                </div>
            )}

            {showForm ? (
                <Card className="border-blue-100 shadow-lg shadow-blue-500/5 rounded-[1.5rem] bg-white overflow-hidden animate-in zoom-in-95">
                    <CardHeader className="p-6 pb-0 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest">New Member Profile</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} className="h-8 w-8 rounded-full">
                            <X className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <form action={addAction} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField label="Slave Name" name="name" required placeholder="Legal Name" />
                                <FormField label="Relationship" name="relation" required placeholder="e.g. Daughter" />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <FormField label="DOB" name="dob" type="date" />
                                <FormField label="Sex" name="gender" options={[{ value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }, { value: 'O', label: 'Other' }]} />
                                <FormField label="Blood" name="bloodGroup" options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(v => ({ value: v, label: v }))} />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button
                                    type="submit"
                                    disabled={isAdding}
                                    className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold gap-2 active:scale-95"
                                >
                                    {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Link Member
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <Button
                    onClick={() => setShowForm(true)}
                    variant="outline"
                    className="w-full h-14 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-all font-bold gap-3 bg-slate-50/50"
                >
                    <Plus className="w-5 h-5" /> Add Family Connection
                </Button>
            )}
        </div>
    );
}

