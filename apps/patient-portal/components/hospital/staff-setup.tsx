/* eslint-disable */
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Trash2,
  Key,
  HelpCircle,
  Loader2,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

import React, { useState, useTransition, useEffect } from 'react';

import { addStaffWithAccessAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface StaffSetupProps {
  onNext: () => void;
  onPrev: () => void;
  label?: string;
}

interface StaffMember {
  id: string;
  name: string;
  mobile: string;
  role: string;
  loginNeeded: boolean;
}

export default function StaffSetup({
  onNext,
  onPrev,
  label = 'Staff Digitalization',
}: StaffSetupProps) {
  const [isPending, startTransition] = useTransition();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    role: 'RECEPTIONIST',
    loginNeeded: true,
  });

  const loadStaff = async () => {
    try {
      const res = await fetch('/api/hospital/setup/staff');
      if (res.ok) {
        const data = await res.json();
        setStaffList(data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) {
      toast.error('Please enter name and mobile number');
      return;
    }

    startTransition(async () => {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('mobile', formData.mobile);
      data.append('role', formData.role);
      data.append('loginNeeded', String(formData.loginNeeded));

      const res = await addStaffWithAccessAction(null, data);
      if (res.success) {
        toast.success(res.message || 'Staff member added successfully!');
        setFormData({
          name: '',
          mobile: '',
          role: 'RECEPTIONIST',
          loginNeeded: true,
        });
        loadStaff();
      } else {
        toast.error(res.message || 'Failed to add staff.');
      }
    });
  };

  const handleRemoveStaff = async (mobile: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    try {
      const res = await fetch(`/api/hospital/setup/staff?mobile=${mobile}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Staff member removed successfully');
        loadStaff();
      } else {
        toast.error('Failed to remove staff');
      }
    } catch (e) {
      toast.error('An error occurred while removing staff');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4">
      {/* Introduction Card */}
      <div className="bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30 rounded-3xl border border-blue-100 p-6 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">{label}</h2>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed max-w-xl">
            Create user profiles for your clinic receptionist, pharmacy dispenser, and nursing
            staff. Haspataal permits logins via mobile phone numbers, meaning employees do not need
            to register emails to access workflows.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Side: Add Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleAddStaff}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm sticky top-6"
          >
            <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-1.5">
              <UserPlus className="h-4 w-4 text-blue-600" /> Add Staff Member
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Full Name</label>
                <Input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Ramesh Kumar"
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Mobile Number (Login ID)
                </label>
                <Input
                  name="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="e.g. 9876543210"
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Role / Job Title</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="RECEPTIONIST">Receptionist (front-desk)</option>
                  <option value="PHARMACIST">Pharmacist (dispensary)</option>
                  <option value="LAB_TECH">Lab Technician (diagnostics)</option>
                  <option value="NURSE">Nurse (triage/general)</option>
                  <option value="ASSISTANT">Clinical Assistant</option>
                  <option value="BILLING">Billing Officer</option>
                </select>
              </div>

              {/* Login Checkbox */}
              <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-xl p-3">
                <input
                  type="checkbox"
                  id="loginNeeded"
                  name="loginNeeded"
                  checked={formData.loginNeeded}
                  onChange={handleCheckboxChange}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="space-y-0.5">
                  <label
                    htmlFor="loginNeeded"
                    className="text-xs font-bold text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    Enable System Login <Key className="h-3 w-3 text-blue-500" />
                  </label>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Generates a default password identical to their mobile number for system access.
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-2 flex items-center justify-center gap-1"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Register Staff Member'}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Side: Staff List */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm min-h-[350px] flex flex-col">
            <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-blue-600" /> Registered Employees ({staffList.length})
            </h3>

            <div className="flex-1 overflow-y-auto space-y-3">
              <AnimatePresence>
                {staffList.map((member) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-between border border-slate-100 rounded-2xl p-4 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">{member.name}</span>
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase tracking-wide">
                            {member.role.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{member.mobile}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-emerald-600">
                            <Shield className="h-3 w-3" /> Login active
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveStaff(member.mobile)}
                      className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-all"
                      title="Remove Staff"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </motion.div>
                ))}

                {staffList.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 h-full">
                    <Users className="h-12 w-12 text-slate-200 mb-2" />
                    <p className="text-sm font-medium">No staff registered yet</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-[220px] text-center">
                      Use the form on the left to register your front desk or pharmacy staff.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Stepper controls */}
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={onPrev}
                className="rounded-xl border-slate-300 font-bold px-6"
              >
                Back
              </Button>
              <Button
                onClick={onNext}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl px-8 shadow-sm"
              >
                Next Stage: Workflows
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
