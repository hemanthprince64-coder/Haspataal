import React from 'react';
import Link from 'next/link';

interface HubEmptyStateProps {
    city: string;
    specialty: string;
}

export default function HubEmptyState({ city, specialty }: HubEmptyStateProps) {
    return (
        <div className="mt-12 p-12 bg-gray-900/40 border border-gray-800 rounded-3xl text-center backdrop-blur-xl">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-700/50 shadow-2xl">
                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No {specialty} found in {city}</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
                We couldn't find any verified specialists matching your criteria in this location. 
                Our team is working on onboarding more partners in {city} soon.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/" className="px-8 py-3 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all shadow-xl">
                    Back to Home
                </Link>
                <Link href="/doctors" className="px-8 py-3 bg-gray-800 text-white font-bold rounded-2xl border border-gray-700 hover:bg-gray-700 transition-all">
                    View All Doctors
                </Link>
            </div>
            
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left border-t border-gray-800/50 pt-10">
                <div>
                    <h4 className="text-white font-semibold text-sm mb-2">Try nearby cities</h4>
                    <ul className="text-xs text-gray-500 space-y-1">
                        <li className="hover:text-cyan-400 cursor-pointer">Mumbai</li>
                        <li className="hover:text-cyan-400 cursor-pointer">Pune</li>
                        <li className="hover:text-cyan-400 cursor-pointer">Thane</li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-semibold text-sm mb-2">Popular specialties</h4>
                    <ul className="text-xs text-gray-500 space-y-1">
                        <li className="hover:text-cyan-400 cursor-pointer">Dermatologist</li>
                        <li className="hover:text-cyan-400 cursor-pointer">Cardiologist</li>
                        <li className="hover:text-cyan-400 cursor-pointer">Pediatrician</li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-semibold text-sm mb-2">Need help?</h4>
                    <p className="text-xs text-gray-500">Contact our support desk at support@haspataal.com</p>
                </div>
            </div>
        </div>
    );
}
