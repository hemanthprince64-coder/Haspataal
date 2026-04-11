'use client';

import { useActionState, useEffect, useState } from 'react';
import { updatePatientProfile, addFamilyMemberAction, deleteFamilyMemberAction, getPatientFullProfile } from '@/app/actions';
import Link from 'next/link';
import Image from 'next/image';

const initialState = { message: '', success: false };

function SectionHeader({ icon, title, open, onToggle }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all duration-200 border border-slate-200 group"
        >
            <div className="flex items-center gap-3">
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">{title}</span>
            </div>
            <svg
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
    );
}

function FormField({ label, name, type = 'text', defaultValue, required, placeholder, options }) {
    if (options) {
        return (
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
                <select name={name} defaultValue={defaultValue || ''} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-medical-500 focus:border-transparent transition-all outline-none">
                    <option value="">Select</option>
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>
        );
    }
    // format date for date inputs if needed
    let formattedDefault = defaultValue;
    if (type === 'date' && defaultValue) {
        try {
            formattedDefault = new Date(defaultValue).toISOString().split('T')[0];
        } catch (e) { }
    }

    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}{required && ' *'}</label>
            <input
                name={name}
                type={type}
                defaultValue={formattedDefault || ''}
                required={required}
                placeholder={placeholder}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-medical-500 focus:border-transparent transition-all outline-none"
            />
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
        return <div className="py-12 text-center text-slate-500 animate-pulse font-medium">Loading profile data...</div>;
    }

    const p = patient || {};

    if (state?.success) {
        return (
            <div className="py-12 max-w-lg mx-auto animate-fade-in-up">
                <div className="text-center bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-4">
                    <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center text-3xl">✅</div>
                    <h2 className="text-xl font-bold text-emerald-600">Profile Updated!</h2>
                    <p className="text-slate-500 text-sm">{state.message}</p>
                    <Link href="/profile" className="inline-flex items-center gap-2 bg-medical-600 text-white font-semibold py-2.5 px-5 rounded-xl hover:bg-medical-700 transition-all no-underline text-sm">
                        ← Back to Profile
                    </Link>
                </div>
            </div>
        );
    }

    const genderOptions = [
        { value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }, { value: 'O', label: 'Other' }
    ];
    const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(v => ({ value: v, label: v }));
    const maritalOptions = [
        { value: 'Single', label: 'Single' }, { value: 'Married', label: 'Married' },
        { value: 'Divorced', label: 'Divorced' }, { value: 'Widowed', label: 'Widowed' }
    ];

    return (
        <div className="py-6 max-w-2xl mx-auto space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-2">
                <Link href="/profile" className="text-medical-600 hover:text-medical-700 font-medium text-sm no-underline flex items-center gap-1">
                    ← Back
                </Link>
                <h1 className="text-xl font-extrabold text-slate-900">Advanced Details</h1>
            </div>

            <form action={formAction} className="space-y-3">
                {/* Section A: Basic Identity */}
                <SectionHeader icon="👤" title="Basic Identity" open={openSections.identity} onToggle={() => toggleSection('identity')} />
                {openSections.identity && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
                        <FormField label="Full Name" name="name" defaultValue={p.name} required placeholder="Enter full name" />
                        <FormField label="Nickname" name="nickname" defaultValue={p.nickname} placeholder="What should we call you?" />
                        {/* Profile Photo Upload */}
                        <div className="space-y-1.5 pt-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Profile Photo</label>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-400">
                                    {p.profilePhotoUrl ? (
                                        <Image src={p.profilePhotoUrl} alt="Avatar" width={64} height={64} className="w-full h-full object-cover" />
                                    ) : (
                                        "👤"
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        name="profilePhotoFile"
                                        accept="image/*"
                                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-medical-50 file:text-medical-700 hover:file:bg-medical-100 transition-all cursor-pointer"
                                    />
                                    <p className="text-xs text-slate-400 mt-1.5">Max size 5MB. Jpeg or Png.</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Date of Birth" name="dob" type="date" defaultValue={p.dob} />
                            <FormField label="Gender" name="gender" defaultValue={p.gender} options={genderOptions} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Blood Group" name="bloodGroup" defaultValue={p.bloodGroup} options={bloodGroupOptions} />
                            <FormField label="Email" name="email" type="email" defaultValue={p.email} placeholder="your@email.com" />
                        </div>
                    </div>
                )}

                {/* Section B: Demographics */}
                <SectionHeader icon="🏠" title="Demographic Details" open={openSections.demographics} onToggle={() => toggleSection('demographics')} />
                {openSections.demographics && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
                        <FormField label="Address" name="address" defaultValue={p.address} placeholder="Street address" />
                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="City" name="city" defaultValue={p.city} placeholder="City" />
                            <FormField label="State" name="state" defaultValue={p.state} placeholder="State" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Country" name="country" defaultValue={p.country} placeholder="Country" />
                            <FormField label="PIN Code" name="pincode" defaultValue={p.pincode} placeholder="Postal code" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Occupation" name="occupation" defaultValue={p.occupation} placeholder="Your occupation" />
                            <FormField label="Marital Status" name="maritalStatus" defaultValue={p.maritalStatus} options={maritalOptions} />
                        </div>
                    </div>
                )}

                {/* Section C: Emergency Contact */}
                <SectionHeader icon="🚨" title="Emergency Contact" open={openSections.emergency} onToggle={() => toggleSection('emergency')} />
                {openSections.emergency && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Contact Name" name="emergencyContactName" defaultValue={p.emergencyContactName} placeholder="Emergency contact" />
                            <FormField label="Relationship" name="emergencyContactRelation" defaultValue={p.emergencyContactRelation} placeholder="e.g. Spouse, Parent" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Phone Number" name="emergencyContactPhone" defaultValue={p.emergencyContactPhone} placeholder="+91..." />
                            <FormField label="Alt Phone" name="emergencyContactAltPhone" defaultValue={p.emergencyContactAltPhone} placeholder="Alternate number" />
                        </div>
                    </div>
                )}

                {/* Section D: Preferences */}
                <SectionHeader icon="⭐" title="Preferred Hospital / Doctor" open={openSections.preferences} onToggle={() => toggleSection('preferences')} />
                {openSections.preferences && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
                        <FormField label="Preferred Hospital" name="preferredHospital" defaultValue={p.preferredHospital} placeholder="e.g. Apollo Hospitals" />
                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Preferred Speciality" name="preferredSpeciality" defaultValue={p.preferredSpeciality} placeholder="e.g. Pediatrics" />
                            <FormField label="Preferred Doctor" name="preferredDoctor" defaultValue={p.preferredDoctor} placeholder="e.g. Dr. X" />
                        </div>
                    </div>
                )}

                {state?.message && !state.success && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                        ⚠️ {state.message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-3 rounded-xl text-sm font-bold bg-medical-600 text-white hover:bg-medical-700 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                >
                    {isPending ? '⏳ Saving...' : '✓ Save Profile'}
                </button>
            </form>

            {/* Family Members Section - separate forms */}
            <div className="pt-4 border-t border-slate-200">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    👨‍👩‍👧‍👦 Family Members
                </h2>
                <p className="text-xs text-slate-400 mb-4">Manage family health profiles linked to your account.</p>

                <FamilyMemberForm members={p.familyMembers || []} />
            </div>
        </div>
    );
}

function FamilyMemberForm({ members }) {
    const [addState, addAction, isAdding] = useActionState(addFamilyMemberAction, initialState);
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="space-y-3">
            {members?.length > 0 && (
                <div className="space-y-2 mb-4">
                    {members.map(m => (
                        <div key={m.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                            <div>
                                <h4 className="font-bold text-sm text-slate-800">{m.name}</h4>
                                <p className="text-xs text-slate-500">{m.relation} • {m.gender} • {m.bloodGroup}</p>
                            </div>
                            <form action={deleteFamilyMemberAction}>
                                <input type="hidden" name="id" value={m.id} />
                                <button type="submit" className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 bg-red-50 rounded-md">Remove</button>
                            </form>
                        </div>
                    ))}
                </div>
            )}
            {addState?.success && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm">
                    ✅ {addState.message}
                </div>
            )}
            {addState?.message && !addState.success && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                    ⚠️ {addState.message}
                </div>
            )}

            {showForm ? (
                <form action={addAction} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="Name" name="name" required placeholder="Member name" />
                        <FormField label="Relation" name="relation" required placeholder="e.g. Son, Mother" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <FormField label="Date of Birth" name="dob" type="date" />
                        <FormField label="Gender" name="gender" options={[
                            { value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }, { value: 'O', label: 'Other' }
                        ]} />
                        <FormField label="Blood Group" name="bloodGroup" options={
                            ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(v => ({ value: v, label: v }))
                        } />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={isAdding}
                            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-all cursor-pointer"
                        >
                            {isAdding ? '⏳ Adding...' : '+ Add Member'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full py-3 rounded-xl text-sm font-semibold border-2 border-dashed border-slate-300 text-slate-500 hover:border-medical-400 hover:text-medical-600 transition-all cursor-pointer bg-transparent"
                >
                    + Add Family Member
                </button>
            )}
        </div>
    );
}
