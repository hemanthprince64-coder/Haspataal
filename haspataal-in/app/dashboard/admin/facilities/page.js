'use client';

import { useState, useEffect } from 'react';
import { getHospitalFacilities, updateHospitalFacilities } from '@/app/actions/admin';

export default function FacilitiesPage() {
    const [facilities, setFacilities] = useState(null);

    useEffect(() => {
        fetchFacilities();
    }, []);

    const fetchFacilities = async () => {
        const res = await getHospitalFacilities();
        if (res.success) setFacilities(res.data || {});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        // formData.append('hospitalId', hospitalId); // Handled by Session
        const res = await updateHospitalFacilities(null, formData);
        if (res.success) alert('Saved!');
    };


    return (
        <div className="p-6 max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Facility Management</h1>
            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow border">

                <div className="flex items-center gap-3">
                    <input type="checkbox" name="icuAvailable" defaultChecked={facilities?.icuAvailable} className="h-5 w-5" />
                    <label className="font-medium">ICU Available</label>
                </div>

                <div className="flex items-center gap-3">
                    <input type="checkbox" name="nicuAvailable" defaultChecked={facilities?.nicuAvailable} className="h-5 w-5" />
                    <label className="font-medium">NICU Available</label>
                </div>

                <div className="flex items-center gap-3">
                    <input type="checkbox" name="emergency24x7" defaultChecked={facilities?.emergency24x7} className="h-5 w-5" />
                    <label className="font-medium">24x7 Emergency</label>
                </div>

                <div className="flex items-center gap-3">
                    <input type="checkbox" name="ambulanceAvailable" defaultChecked={facilities?.ambulanceAvailable} className="h-5 w-5" />
                    <label className="font-medium">Ambulance Service</label>
                </div>

                <div className="flex items-center gap-3">
                    <input type="checkbox" name="pharmacyAvailable" defaultChecked={facilities?.pharmacyAvailable} className="h-5 w-5" />
                    <label className="font-medium">Pharmacy</label>
                </div>

                <div className="flex items-center gap-3">
                    <input type="checkbox" name="labAvailable" defaultChecked={facilities?.labAvailable} className="h-5 w-5" />
                    <label className="font-medium">In-house Lab</label>
                </div>

                <div>
                    <label className="block font-medium mb-1">OT Count</label>
                    <input
                        type="number"
                        name="otCount"
                        defaultValue={facilities?.otCount || 0}
                        className="p-2 border rounded w-full"
                    />
                </div>

                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
                    Save Changes
                </button>
            </form>
        </div>
    );
}
