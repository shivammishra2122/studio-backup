"use client";

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import SidebarNav from '@/components/layout/sidebar-nav';
import { TopNav } from '@/components/layout/top-nav';
import type { Patient } from '@/lib/constants';
import PatientsPage from '@/app/patients/page';
import DashboardPage from '@/app/page';
import RadiologyPage from '@/app/radiology/page';

export default function ClientLayout({
    children,
    mockPatients,
    patientData,
}: {
    children: React.ReactNode;
    mockPatients: Patient[];
    patientData: any;
}) {
    const pathname = usePathname();
    const hideLayout = pathname === '/login' || pathname === '/patients';
    const [selectedPatient, setSelectedPatient] = useState<Patient>(mockPatients[0]);

    if (pathname === '/patients') {
        return (
            <PatientsPage />
        );
    }

    if (hideLayout) {
        return <>{children}</>;
    }

    return (
        <SidebarProvider>
            <div className="flex h-screen overflow-hidden">
                <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border">
                    <SidebarNav />
                </Sidebar>
                <SidebarInset className="flex-1 flex flex-col bg-background">
                    <TopNav />
                    <main className="flex-1 overflow-hidden bg-gray-50">
                        {pathname === '/' ? (
                            <DashboardPage
                                patient={selectedPatient}
                                problems={patientData[selectedPatient.id as keyof typeof patientData].problems}
                                medications={patientData[selectedPatient.id as keyof typeof patientData].medications}
                                allergies={patientData[selectedPatient.id as keyof typeof patientData].allergies}
                                vitals={patientData[selectedPatient.id as keyof typeof patientData].vitals}
                            />
                        ) : pathname === '/radiology' ? (
                            <RadiologyPage patient={selectedPatient} />
                        ) : (
                            children
                        )}
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
} 