import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import type { Patient } from '@/lib/constants';
import ClientLayout from '@/components/layout/client-layout';


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const mockPatients: Patient[] = [
  {
    id: '900752869578',
    name: 'Sarah Miller',
    Name: 'Sarah Miller',
    avatarUrl: '',
    gender: 'F',
    Gender: 'F',
    age: 42,
    Age: 42,
    dob: '1982-03-15',
    DOB: '1982-03-15',
    wardNo: 'C-305',
    Ward: 'C-305',
    bedDetails: 'Bed A',
    Bed: 'Bed A',
    admissionDate: '2024-07-15',
    "Admission Date": '2024-07-15',
    lengthOfStay: '5 days',
    LOS: '5 days',
    mobile: '+1-555-0102',
    "Mobile No": 15550102,
    primaryConsultant: 'Dr. Emily Carter',
    "Primary Consultant": 'Dr. Emily Carter',
    "Secondary Consultant": 'Dr. Smith',
    "Treating Consultant": 'Dr. Emily Carter',
    specialty: 'Cardiology',
    Specialty: 'Cardiology',
    encounterProvider: 'City General Hospital',
    finalDiagnosis: 'Acute Bronchitis',
    posting: 'General Medicine',
    reasonForVisit: 'Routine Check-up & Consultation',
    ssn: '900752869578',
    "IP No": 12345,
    DFN: 12345
  },
  {
    id: '900752869579',
    name: 'John Doe',
    Name: 'John Doe',
    avatarUrl: '',
    gender: 'M',
    Gender: 'M',
    age: 35,
    Age: 35,
    dob: '1989-08-22',
    DOB: '1989-08-22',
    wardNo: 'B-204',
    Ward: 'B-204',
    bedDetails: 'Bed C',
    Bed: 'Bed C',
    admissionDate: '2024-07-16',
    "Admission Date": '2024-07-16',
    lengthOfStay: '4 days',
    LOS: '4 days',
    mobile: '+1-555-0103',
    "Mobile No": 15550103,
    primaryConsultant: 'Dr. Robert Johnson',
    "Primary Consultant": 'Dr. Robert Johnson',
    "Secondary Consultant": 'Dr. Smith',
    "Treating Consultant": 'Dr. Robert Johnson',
    specialty: 'Neurology',
    Specialty: 'Neurology',
    encounterProvider: 'City General Hospital',
    finalDiagnosis: 'Migraine',
    posting: 'Neurology',
    reasonForVisit: 'Headache evaluation',
    ssn: '900752869579',
    "IP No": 12346,
    DFN: 12346
  },
  {
    id: '900752869580',
    name: 'Emma Wilson',
    Name: 'Emma Wilson',
    avatarUrl: '',
    gender: 'F',
    Gender: 'F',
    age: 28,
    Age: 28,
    dob: '1995-12-05',
    DOB: '1995-12-05',
    wardNo: 'A-101',
    Ward: 'A-101',
    bedDetails: 'Bed B',
    Bed: 'Bed B',
    admissionDate: '2024-07-17',
    "Admission Date": '2024-07-17',
    lengthOfStay: '3 days',
    LOS: '3 days',
    mobile: '+1-555-0104',
    "Mobile No": 15550104,
    primaryConsultant: 'Dr. Lisa Wong',
    "Primary Consultant": 'Dr. Lisa Wong',
    "Secondary Consultant": 'Dr. Smith',
    "Treating Consultant": 'Dr. Lisa Wong',
    specialty: 'Pediatrics',
    Specialty: 'Pediatrics',
    encounterProvider: 'City General Hospital',
    finalDiagnosis: 'Influenza',
    posting: 'Pediatrics',
    reasonForVisit: 'Fever and cough',
    ssn: '900752869580',
    "IP No": 12347,
    DFN: 12347
  },
];

const patientData = {
  '900752869578': {
    problems: [
      { id: 'prob1', description: 'Chronic Hypertension' },
      { id: 'prob2', description: 'Type 2 Diabetes Mellitus' },
    ],
    medications: [
      { id: '1', name: 'UltraVit OMEGA + DHA', status: 'Active' as 'Active' },
      { id: '2', name: 'Clopidogrel', status: 'Active' as 'Active' },
    ],
    allergies: [
      { id: '1', allergen: 'Peanuts', reaction: 'Rash', severity: 'Moderate' as 'Moderate', dateOnset: '2023-01-15', treatment: 'Antihistamine', status: 'Active' as 'Active', notes: 'Avoid all peanut products', createdBy: 'Dr. Smith', createdAt: '2023-01-15T10:00:00Z' },
    ],
    vitals: {},
  },
  '900752869579': {
    problems: [
      { id: 'prob3', description: 'Hypertension' },
    ],
    medications: [
      { id: '3', name: 'Aspirin', status: 'Active' as 'Active' },
    ],
    allergies: [
      { id: '2', allergen: 'Shellfish', reaction: 'Anaphylaxis', severity: 'Severe' as 'Severe', dateOnset: '2022-06-10', treatment: 'Epinephrine', status: 'Active' as 'Active', notes: 'Carry epinephrine', createdBy: 'Dr. Jones', createdAt: '2022-06-10T14:30:00Z' },
    ],
    vitals: {},
  },
  '900752869580': {
    problems: [
      { id: 'prob4', description: 'Diabetes Mellitus' },
    ],
    medications: [
      { id: '4', name: 'Metformin', status: 'Active' as 'Active' },
    ],
    allergies: [],
    vitals: {},
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <ClientLayout
          mockPatients={mockPatients}
          patientData={patientData}
        >
          {children}
        </ClientLayout>
        <Toaster />
      </body>
    </html>
  );
}