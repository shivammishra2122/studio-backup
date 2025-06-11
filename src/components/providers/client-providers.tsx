"use client";

import { ReactNode, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PatientProvider } from "@/context/patient-context";
import { Toaster } from "@/components/ui/toaster";
import ClientLayout from "@/components/layout/client-layout";

interface Props {
  children: ReactNode;
}

// Mock patient data for development (client side only)
// @ts-ignore
const mockPatients: any[] = [
  {
    id: "900752869578",
    name: "Sarah Miller",
    Name: "Sarah Miller",
    avatarUrl: "",
    gender: "F",
    Gender: "F",
    age: 42,
    Age: 42,
    dob: "1982-03-15",
    DOB: "1982-03-15",
    wardNo: "C-305",
    Ward: "C-305",
    bedDetails: "Bed A",
    Bed: "Bed A",
    admissionDate: "2024-07-15",
    "Admission Date": "2024-07-15",
    lengthOfStay: "5 days",
    LOS: "5 days",
    mobile: "+1-555-0102",
    "Mobile No": 15550102,
    primaryConsultant: "Dr. Emily Carter",
    "Primary Consultant": "Dr. Emily Carter",
    "Secondary Consultant": "Dr. Smith",
    "Treating Consultant": "Dr. Emily Carter",
    specialty: "Cardiology",
    Specialty: "Cardiology",
    encounterProvider: "City General Hospital",
    finalDiagnosis: "Acute Bronchitis",
    posting: "General Medicine",
    reasonForVisit: "Routine Check-up & Consultation",
    ssn: "900752869578",
    "IP No": 12345,
    DFN: 12345,
  },
];

const patientData: Record<string, any> = {
  "900752869578": {
    problems: [{ id: "prob1", description: "Chronic Hypertension" }],
    medications: [{ id: "1", name: "Lisinopril", status: "Active" as "Active" }],
    allergies: [],
    vitals: {},
  },
};

export default function ClientProviders({ children }: Props) {
  // Ensure the same QueryClient instance is used across re-renders
  const queryClientRef = useRef<QueryClient>();
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <PatientProvider>
        <ClientLayout mockPatients={mockPatients} patientData={patientData}>
          {children}
        </ClientLayout>
        <Toaster />
      </PatientProvider>
    </QueryClientProvider>
  );
}
