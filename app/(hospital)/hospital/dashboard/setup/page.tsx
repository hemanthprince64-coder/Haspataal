"use client";

import { CheckCircle, Settings, Hospital, Users, Bell, CreditCard } from "lucide-react";

const SETUP_SECTIONS = [
  {
    id: "hospital-profile",
    title: "Hospital Profile",
    description: "Configure your hospital's name, address, logo, and contact information.",
    icon: Hospital,
    href: "/hospital/dashboard/setup/profile",
    status: "active",
  },
  {
    id: "staff-management",
    title: "Staff & Roles",
    description: "Add doctors, nurses, and admin staff. Configure role-based access.",
    icon: Users,
    href: "/hospital/dashboard/setup/staff",
    status: "active",
  },
  {
    id: "notifications",
    title: "Notification Settings",
    description: "Configure SMS, email, and WhatsApp alert templates.",
    icon: Bell,
    href: "/hospital/dashboard/setup/notifications",
    status: "active",
  },
  {
    id: "billing",
    title: "Billing Configuration",
    description: "Set up billing codes, tax rates, and payment gateway integration.",
    icon: CreditCard,
    href: "/hospital/dashboard/setup/billing",
    status: "active",
  },
];

export default function SetupPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-7 w-7 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Hospital Setup</h1>
          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
            Active
          </span>
        </div>
        <p className="text-gray-500 text-sm">
          Configure your hospital profile, staff, and system preferences.
        </p>
      </div>

      {/* Setup Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SETUP_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <a
              key={section.id}
              href={section.href}
              className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{section.title}</h3>
                    <CheckCircle className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{section.description}</p>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
