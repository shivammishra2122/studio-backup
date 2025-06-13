'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/services/api';
import { Patient } from '@/lib/constants';
import { PatientProvider } from '@/hooks/use-patient';
// import SidebarNav from '@/components/layout/sidebar-nav';
// import { TopNav } from '@/components/layout/top-nav';
// import PatientNav from '@/components/layout/patient-nav';

// Define the API response type
interface ApiPatient {
    DFN: number;
    Name: string;
    Gender: string;
    Age: string | number;
    DOB: string;
    Ward: string;
    Bed: string;
    "Admission Date": string;
    LOS: string;
    "Mobile No": number;
    "Primary Consultant": string;
    Specialty: string;
    "Treating Consultant": string;
    SSN: string;
    "IP No": number;
    "Secondary Consultant": string;
}

export default function PatientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { id } = useParams();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                setLoading(true);
                const data = await api.getPatients();
                if (Array.isArray(data)) {
                    const found = (data as ApiPatient[]).find((p) => String(p.DFN) === String(id));
                    if (found) {
                        // Transform API patient data to match the expected Patient type
                        const transformedPatient: Patient = {
                            id: String(found.DFN || ''),
                            name: found.Name || 'Unknown',
                            avatarUrl: '',
                            gender: found.Gender || '',
                            age: typeof found.Age === 'number' ? found.Age : parseInt(found.Age) || 0,
                            dob: found.DOB || '',
                            wardNo: found.Ward || '',
                            bedDetails: found.Bed || '',
                            admissionDate: found["Admission Date"] || '',
                            lengthOfStay: found.LOS || '',
                            mobile: String(found["Mobile No"] || ''),
                            primaryConsultant: found["Primary Consultant"] || '',
                            specialty: found.Specialty || '',
                            encounterProvider: found["Treating Consultant"] || '',
                            finalDiagnosis: '',
                            posting: found.Specialty || '',
                            reasonForVisit: '',
                            ssn: String(found.SSN || ''),
                            "Admission Date": found["Admission Date"] || '',
                            Age: found.Age,
                            Bed: found.Bed || '',
                            DFN: found.DFN || 0,
                            DOB: found.DOB || '',
                            Gender: found.Gender || '',
                            "IP No": found["IP No"] || 0,
                            LOS: found.LOS || '',
                            "Mobile No": found["Mobile No"] || 0,
                            Name: found.Name || '',
                            "Primary Consultant": found["Primary Consultant"] || '',
                            "Secondary Consultant": found["Secondary Consultant"] || '',
                            Specialty: found.Specialty || '',
                            "Treating Consultant": found["Treating Consultant"] || '',
                            Ward: found.Ward || '',
                        };
                        setPatient(transformedPatient);
                    }
                }
            } catch (error) {
                console.error('Error fetching patient:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPatient();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-screen">
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground">Loading patient data...</p>
                </div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="flex h-screen">
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground">Patient not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* <SidebarNav /> */}
            <div className="flex-1 flex flex-col min-h-0">
                {/* <TopNav /> */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* PatientNav removed */}
                    <PatientProvider patient={patient}>
                        <main className="flex-1 overflow-auto px-2 md:px-4 pt-2">
                            {children}
                        </main>
                    </PatientProvider>
                </div>
            </div>
        </div>
    );
} 