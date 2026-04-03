'use client';

import { useEffect, useState } from "react";
import { getPatientFullProfile, addAddressAction, deleteAddressAction, setDefaultAddressAction } from "@/app/actions";
import Link from "next/link";

export default function AddressesPage() {
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [message, setMessage] = useState('');

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

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const res = await addAddressAction(null, formData);
        setMessage(res.message);
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

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse font-bold">Loading addresses...</div>;

    const addresses = patient?.addresses || [];

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                  <Link href="/profile" className="text-blue-600 font-bold mb-2 inline-block">← Back to Profile</Link>
                  <h1 className="text-3xl font-black text-[#0D2B55]">Saved Addresses</h1>
                </div>
                <button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition"
                >
                    {showAddForm ? 'Cancel' : '+ Add Address'}
                </button>
            </div>

            {message && <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold border border-blue-200">{message}</div>}

            {showAddForm && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-fade-in">
                    <h2 className="text-xl font-black mb-4">Add New Address</h2>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Type</label>
                                <select name="type" className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 font-medium">
                                    <option value="Home">Home</option>
                                    <option value="Work">Work</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">City</label>
                                <input name="city" required placeholder="Mumbai" className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 font-medium"/>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-600 mb-1">Street Address</label>
                                <textarea name="address" required placeholder="Flat, Building, Street" rows="2" className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 font-medium"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">State</label>
                                <input name="state" placeholder="Maharashtra" className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 font-medium"/>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Pincode</label>
                                <input name="pincode" required placeholder="400001" className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 font-medium"/>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-600 mb-1">Landmark (Optional)</label>
                                <input name="landmark" placeholder="Near Apollo Pharmacy" className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 font-medium"/>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            <input type="checkbox" name="isDefault" value="true" id="isDefault" className="w-5 h-5 accent-blue-600" />
                            <label htmlFor="isDefault" className="font-bold text-slate-700">Set as default address</label>
                        </div>
                        <button type="submit" className="w-full mt-4 bg-blue-600 text-white font-black p-4 rounded-xl hover:bg-blue-700 transition">Save Address</button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.length === 0 && !showAddForm && (
                    <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                        <div className="text-4xl mb-3">📍</div>
                        <p className="text-slate-500 font-bold">No saved addresses yet.</p>
                    </div>
                )}
                {addresses.map(addr => (
                    <div key={addr.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative">
                        {addr.isDefault && (
                            <span className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 text-xs font-black px-2 py-1 rounded-md uppercase">Default</span>
                        )}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">{addr.type === 'Home' ? '🏠' : addr.type === 'Work' ? '🏢' : '📍'}</span>
                            <h3 className="font-black text-lg text-[#0D2B55]">{addr.type}</h3>
                        </div>
                        <p className="text-slate-600 font-medium mb-1">{addr.address}</p>
                        {addr.landmark && <p className="text-slate-500 text-sm mb-1">Landmark: {addr.landmark}</p>}
                        <p className="text-slate-600 font-medium mb-4">{addr.city}, {addr.state} - {addr.pincode}</p>
                        
                        <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                            {!addr.isDefault && (
                                <button onClick={() => handleMakeDefault(addr.id)} className="text-sm font-bold text-blue-600 hover:text-blue-800">Make Default</button>
                            )}
                            <button onClick={() => handleDelete(addr.id)} className="text-sm font-bold text-red-500 hover:text-red-700 ml-auto">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
