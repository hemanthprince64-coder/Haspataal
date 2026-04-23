"use client";

import React from "react";
import Link from "next/link";
import { Hospital, Activity, ShieldCheck, MapPin, Phone, Mail } from "lucide-react";

export default function FooterLinks() {
    return (
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Hospital className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-extrabold text-white tracking-tight">Haspataal</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    India&apos;s ultimate healthcare discovery and continuous care platform. Assisting patients transparently from triage to recovery.
                </p>
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors cursor-pointer">
                        <Activity className="w-4 h-4"/>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-colors cursor-pointer">
                        <ShieldCheck className="w-4 h-4"/>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-white font-bold mb-6 tracking-wide">For Patients</h3>
                <ul className="space-y-4 text-sm">
                    <li><Link href="/search" className="hover:text-blue-400 transition-colors no-underline">Find Doctors</Link></li>
                    <li><Link href="/hospitals" className="hover:text-blue-400 transition-colors no-underline">Top Hospitals</Link></li>
                    <li><Link href="/medchat" className="hover:text-blue-400 transition-colors no-underline">MedChat AI Consult</Link></li>
                    <li><Link href="/records" className="hover:text-blue-400 transition-colors no-underline">Health Records Vault</Link></li>
                </ul>
            </div>

            <div>
                <h3 className="text-white font-bold mb-6 tracking-wide">Legal & Support</h3>
                <ul className="space-y-4 text-sm">
                    <li><Link href="#" className="hover:text-blue-400 transition-colors no-underline">Privacy Policy</Link></li>
                    <li><Link href="#" className="hover:text-blue-400 transition-colors no-underline">Terms of Service</Link></li>
                    <li><Link href="/emergency" className="text-red-400 hover:text-red-300 transition-colors no-underline">Emergency Protocol</Link></li>
                    <li><Link href="#" className="hover:text-blue-400 transition-colors no-underline">Help Center</Link></li>
                </ul>
            </div>

            <div>
                <h3 className="text-white font-bold mb-6 tracking-wide">Contact Us</h3>
                <ul className="space-y-4 text-sm">
                    <li className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-slate-500 mt-0.5" />
                        <span>Haspataal HQ, BKC<br/>Mumbai, India 400051</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-slate-500" />
                        <span>1800-HASPATAAL</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-slate-500" />
                        <span>care@haspataal.com</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
