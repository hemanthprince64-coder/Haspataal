'use client';

import { Hospital, MapPin, Phone, Mail } from 'lucide-react';

import React from 'react';

import Link from 'next/link';

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a10.009 10.009 0 01-4.918-1.43l-.424-.256-4.928.803.779-4.107-.245-.414A10.008 10.008 0 011.865 5.648l.202-.073.017.006C3.042 6.472 6.484 9.277 10.58 11.143l.203.08.032.016a3.85 3.85 0 01.195.066c.7.288 1.34.497 1.914.627a9.9 9.9 0 001.689-.567l.256-.154.008.007c.197.097.387.2.57.312.44.267.888.585 1.247.94l-.333.63-.218.413a10.001 10.001 0 01-4.854 1.806l-.287.089-.003.003a10.009 10.009 0 01-2.033-.547l-.28-.143-.016.009zM12.032 7.39l.013.009-.013-.009z" />
    </svg>
  );
}

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
          India&apos;s ultimate healthcare discovery and continuous care platform. Assisting
          patients transparently from triage to recovery.
        </p>
        <div className="flex gap-4">
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
          >
            <LinkedInIcon className="w-4 h-4" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white transition-colors"
          >
            <TwitterIcon className="w-4 h-4" />
          </a>
          <a
            href="https://wa.me"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors"
          >
            <WhatsAppIcon className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div>
        <h3 className="text-white font-bold mb-6 tracking-wide">For Patients</h3>
        <ul className="space-y-4 text-sm">
          <li>
            <Link href="/search" className="hover:text-blue-400 transition-colors no-underline">
              Find Doctors
            </Link>
          </li>
          <li>
            <Link href="/hospitals" className="hover:text-blue-400 transition-colors no-underline">
              Top Hospitals
            </Link>
          </li>
          <li>
            <Link href="/medchat" className="hover:text-blue-400 transition-colors no-underline">
              MedChat AI Consult
            </Link>
          </li>
          <li>
            <Link href="/records" className="hover:text-blue-400 transition-colors no-underline">
              Health Records Vault
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-white font-bold mb-6 tracking-wide">Legal & Support</h3>
        <ul className="space-y-4 text-sm">
          <li>
            <Link href="#" className="hover:text-blue-400 transition-colors no-underline">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link href="#" className="hover:text-blue-400 transition-colors no-underline">
              Terms of Service
            </Link>
          </li>
          <li>
            <Link
              href="/emergency"
              className="text-red-400 hover:text-red-300 transition-colors no-underline"
            >
              Emergency Protocol
            </Link>
          </li>
          <li>
            <Link href="#" className="hover:text-blue-400 transition-colors no-underline">
              Help Center
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-white font-bold mb-6 tracking-wide">Contact Us</h3>
        <ul className="space-y-4 text-sm">
          <li className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-slate-500 mt-0.5" />
            <span>
              Haspataal HQ, BKC
              <br />
              Mumbai, India 400051
            </span>
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
