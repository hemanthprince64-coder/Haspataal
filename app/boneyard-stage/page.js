"use client";

import { Skeleton } from 'boneyard-js/react';
import ProfileCard from '@/components/patient/ProfileCard';
import ClinicalServices from '@/components/patient/ClinicalServices';
import AppointmentsList from '@/components/patient/AppointmentsList';
import WalletHeader from '@/components/patient/WalletHeader';
import TransactionHistory from '@/components/patient/TransactionHistory';
import RecordsList from '@/components/patient/RecordsList';
import VitalsQuickStats from '@/components/patient/VitalsQuickStats';
import VitalsHistory from '@/components/patient/VitalsHistory';
import MedicationsList from '@/components/patient/MedicationsList';
import PrescriptionsList from '@/components/patient/PrescriptionsList';
import VaccinationsList from '@/components/patient/VaccinationsList';
import MaternalHealthHero from '@/components/patient/MaternalHealthHero';
import HospitalStatsGrid from '@/components/hospital/HospitalStatsGrid';
import RecentVisitsTable from '@/components/hospital/RecentVisitsTable';
import LabStatsGrid from '@/components/hospital/LabStatsGrid';
import LabOrdersList from '@/components/hospital/LabOrdersList';
import LabCatalogOverview from '@/components/hospital/LabCatalogOverview';
import AdminStatsGrid from '@/components/admin/AdminStatsGrid';
import PlatformGrowthCard from '@/components/admin/PlatformGrowthCard';
import AgentStatsGrid from '@/components/agent/AgentStatsGrid';
import OnboardedHospitalsList from '@/components/agent/OnboardedHospitalsList';
import OnboardedPatientsList from '@/components/agent/OnboardedPatientsList';

export default function BoneyardStage() {
    const mockPatient = {
        name: "Mock Patient",
        phone: "+91 98765 43210",
        nickname: "Mocky",
        wallet: { balance: 1000 }
    };

    const mockTransactions = [
        {
            id: "t1",
            type: "CREDIT",
            amount: 500,
            source: "TOPUP",
            description: "Mock Credit",
            createdAt: new Date().toISOString()
        }
    ];

    const mockRecords = [
        {
            id: "r1",
            type: "Prescription",
            doctor: "Dr. Mock",
            date: "01 Jan 2024",
            icon: "💊"
        }
    ];

    const mockVitals = [
        {
            id: "v1",
            weight: 70,
            bloodPressure: "120/80",
            bloodSugar: 100,
            spo2: 98,
            recordedAt: new Date().toISOString()
        }
    ];

    const mockMedications = [
        {
            id: "m1",
            drugName: "Mock Drug",
            dose: "500mg",
            frequency: "BID",
            startDate: new Date().toISOString()
        }
    ];

    const mockPrescriptions = [
        {
            id: "p1",
            type: 'STRUCTURED',
            createdAt: new Date().toISOString(),
            items: [{ medicineName: "Mock Med", dosage: "1-0-1", duration: "5 days" }]
        }
    ];

    const mockVaccinations = [
        {
            id: "vac1",
            vaccineName: "Mock Vaccine",
            dateGiven: new Date().toISOString()
        }
    ];

    const mockHospitalStats = { todayVisits: 12, totalPatients: 450, totalDoctors: 15, scheduledVisits: 8, totalVisits: 1200, completedVisits: 1180 };
    const mockHospitalVisits = [
        { id: "v1", date: new Date().toISOString(), patientId: "P-101", doctorId: "D-202", status: "COMPLETED" },
        { id: "v2", date: new Date().toISOString(), patientId: "P-102", doctorId: "D-203", status: "PENDING" }
    ];
    const mockLabOrders = [
        { id: "order-1", status: "COLLECTED", totalAmount: 1200, patient: { name: "John Doe" } },
        { id: "order-2", status: "PENDING", totalAmount: 850, patient: { name: "Jane Smith" } }
    ];
    const mockLabCatalog = [
        { id: "cat-1", price: 500, category: { name: "Full Blood Count" } },
        { id: "cat-2", price: 1500, category: { name: "MRI Brain" } }
    ];

    const mockAdminStats = { totalHospitals: 45, activeHospitals: 42, pendingHospitals: 3, totalDoctors: 150, totalPatients: 2000, totalVisits: 8500, cities: 12 };
    const mockAgentStats = { totalHospitals: 8, approvedHospitals: 6, totalPatients: 120 };
    const mockAgentHospitals = [
        { id: "h1", legalName: "Apollo Clinic", createdAt: new Date().toISOString(), verificationStatus: "VERIFIED" },
        { id: "h2", legalName: "City Diagnostics", createdAt: new Date().toISOString(), verificationStatus: "PENDING" }
    ];
    const mockAgentPatients = [
        { id: "p1", name: "Alice Blue", createdAt: new Date().toISOString() },
        { id: "p2", name: "Bob Red", createdAt: new Date().toISOString() }
    ];

    return (
        <div className="p-8 space-y-12 bg-white min-h-screen">
            <h1 className="text-2xl font-bold text-slate-400 mb-8 uppercase tracking-widest text-center">
                Boneyard Staging Area (Global)
            </h1>

            <section className="max-w-4xl mx-auto space-y-12">
                {/* --- PATIENT PORTAL --- */}
                <div className="border-b border-slate-100 pb-4 mb-8">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Patient Portal</h2>
                </div>

                <div>
                    <h2 className="text-xs font-bold text-slate-300 uppercase mb-4">Patient Profile</h2>
                    <Skeleton name="patient-profile-card" loading={false}>
                        <ProfileCard patient={mockPatient} />
                    </Skeleton>
                </div>

                <div>
                    <h2 className="text-xs font-bold text-slate-300 uppercase mb-4">Vitals Quick Stats</h2>
                    <Skeleton name="vitals-quick-stats" loading={false}>
                        <VitalsQuickStats latestVital={mockVitals[0]} />
                    </Skeleton>
                </div>

                <div>
                    <h2 className="text-xs font-bold text-slate-300 uppercase mb-4">Vitals History</h2>
                    <Skeleton name="vitals-history" loading={false}>
                        <VitalsHistory vitals={mockVitals} />
                    </Skeleton>
                </div>

                <div>
                    <h2 className="text-xs font-bold text-slate-300 uppercase mb-4">Medications</h2>
                    <Skeleton name="medications-list" loading={false}>
                        <MedicationsList medications={mockMedications} />
                    </Skeleton>
                </div>

                <div>
                    <h2 className="text-xs font-bold text-slate-300 uppercase mb-4">Prescriptions</h2>
                    <Skeleton name="prescriptions-list" loading={false}>
                        <PrescriptionsList prescriptions={mockPrescriptions} />
                    </Skeleton>
                </div>

                <div>
                    <h2 className="text-xs font-bold text-slate-300 uppercase mb-4">Vaccinations</h2>
                    <Skeleton name="vaccinations-list" loading={false}>
                        <VaccinationsList vaccinations={mockVaccinations} />
                    </Skeleton>
                </div>

                <div>
                    <h2 className="text-xs font-bold text-slate-300 uppercase mb-4">Maternal Hero</h2>
                    <Skeleton name="maternal-health-hero" loading={false}>
                        <MaternalHealthHero />
                    </Skeleton>
                </div>

                <div>
                    <h2 className="text-xs font-bold text-slate-300 uppercase mb-4">Wallet Info</h2>
                    <Skeleton name="wallet-header" loading={false}>
                        <WalletHeader balance="1000.00" onTopUp={() => {}} />
                    </Skeleton>
                </div>

                <div>
                    <h2 className="text-xs font-bold text-slate-300 uppercase mb-4">Transactions</h2>
                    <Skeleton name="transaction-history" loading={false}>
                        <TransactionHistory transactions={mockTransactions} />
                    </Skeleton>
                </div>

                <div>
                    <h2 className="text-xs font-bold text-slate-300 uppercase mb-4">Personal Data Grid</h2>
                    <Skeleton name="personal-data-grid" loading={false}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { name: "Edit Profile", icon: "✏️", desc: "Personal & contact info" },
                                { name: "Saved Addresses", icon: "📍", desc: "Home / Work" },
                                { name: "Haspataal Wallet", icon: "💰", desc: "Balance: ₹0.00" }
                            ].map((s, i) => (
                                <div key={i} className="card-clinical p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">{s.icon}</div>
                                    <div>
                                        <div className="text-lg font-black text-[#0D2B55]">{s.name}</div>
                                        <div className="text-xs text-slate-500 font-bold leading-tight">{s.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Skeleton>
                </div>

                <div>
                    <h2 className="text-xs font-bold text-slate-300 uppercase mb-4">Medical Records</h2>
                    <Skeleton name="records-list" loading={false}>
                        <RecordsList records={mockRecords} />
                    </Skeleton>
                </div>

                {/* --- HOSPITAL HMS --- */}
                <div className="border-b border-slate-100 pt-12 pb-4 mb-8">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Hospital HMS</h2>
                </div>

                <div>
                    <h2 className="text-xs font-bold text-slate-300 uppercase mb-4">Hospital Stats</h2>
                    <Skeleton name="hospital-stats-grid" loading={false}>
                        <HospitalStatsGrid stats={mockHospitalStats} />
                    </Skeleton>
                </div>

                <div>
                    <h2 className="text-xs font-bold text-slate-300 uppercase mb-4">Recent Visits</h2>
                    <Skeleton name="recent-visits-table" loading={false}>
                        <RecentVisitsTable visits={mockHospitalVisits} />
                    </Skeleton>
                </div>

                {/* --- LAB DASHBOARD --- */}
                <div className="border-b border-slate-100 pt-12 pb-4 mb-8">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Lab Dashboard</h2>
                </div>

                <div>
                    <h2 className="text-xs font-bold text-slate-300 uppercase mb-4">Lab Stats</h2>
                    <Skeleton name="lab-stats-grid" loading={false}>
                        <LabStatsGrid orderCount={2} catalogCount={2} patientCount={2} />
                    </Skeleton>
                </div>

                <div>
                    <h2 className="text-xs font-bold text-slate-300 uppercase mb-4">Lab Orders</h2>
                    <Skeleton name="lab-orders-list" loading={false}>
                        <LabOrdersList orders={mockLabOrders} />
                    </Skeleton>
                </div>

                <div>
                    <h2 className="text-xs font-bold text-slate-300 uppercase mb-4">Lab Catalog</h2>
                    <Skeleton name="lab-catalog-overview" loading={false}>
                        <LabCatalogOverview catalog={mockLabCatalog} />
                    </Skeleton>
                </div>

                {/* --- ADMIN OVERVIEW --- */}
                <div className="border-b border-slate-100 pt-12 pb-4 mb-8">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Platform Admin</h2>
                </div>

                <div>
                    <h2 className="text-xs font-bold text-slate-300 uppercase mb-4">Admin Stats</h2>
                    <Skeleton name="admin-stats-grid" loading={false}>
                        <AdminStatsGrid stats={mockAdminStats} />
                    </Skeleton>
                </div>

                <div>
                    <h2 className="text-xs font-bold text-slate-300 uppercase mb-4">Platform Growth</h2>
                    <Skeleton name="platform-growth-card" loading={false}>
                        <PlatformGrowthCard />
                    </Skeleton>
                </div>

                {/* --- AGENT PARTNER --- */}
                <div className="border-b border-slate-100 pt-12 pb-4 mb-8">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Agent Partner</h2>
                </div>

                <div>
                    <h2 className="text-xs font-bold text-slate-300 uppercase mb-4">Agent Stats</h2>
                    <Skeleton name="agent-stats-grid" loading={false}>
                        <AgentStatsGrid stats={mockAgentStats} />
                    </Skeleton>
                </div>

                <div>
                    <h2 className="text-xs font-bold text-slate-300 uppercase mb-4">Agent Hospitals</h2>
                    <Skeleton name="agent-hospitals-list" loading={false}>
                        <OnboardedHospitalsList hospitals={mockAgentHospitals} />
                    </Skeleton>
                </div>

                <div>
                    <h2 className="text-xs font-bold text-slate-300 uppercase mb-4">Agent Patients</h2>
                    <Skeleton name="agent-patients-list" loading={false}>
                        <OnboardedPatientsList patients={mockAgentPatients} />
                    </Skeleton>
                </div>
            </section>
        </div>
    );
}
