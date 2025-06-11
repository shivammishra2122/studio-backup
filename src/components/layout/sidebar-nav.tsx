"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { api, Patient } from "@/services/api";
import { 
  User, 
  Phone, 
  BedDouble, 
  CalendarDays, 
  CreditCard,
  LayoutDashboard,
  FileText,
  ClipboardList,
  Stethoscope,
  Activity,
  Pill,
  AlertTriangle,
  HeartPulse
} from 'lucide-react';
import { useSidebar } from "@/components/ui/sidebar";

const navItems: { name: string; icon: any; href: string }[] = [];



export default function SidebarNav() {
  const { id } = useParams();
  const pathname = usePathname();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const { state: sidebarState } = useSidebar();
  const isCollapsed = sidebarState === 'collapsed';

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await api.getPatients();
        if (Array.isArray(data)) {
          const found = (data as any[]).find((p: any) => String(p.DFN) === String(id));
          if (found) {
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
              finalDiagnosis: found["Final Diagnosis"] || '',
              posting: found.Posting || '',
              reasonForVisit: found["Reason For Visit"] || '',
              ssn: String(found.SSN || ''),
              // Include other fields from ApiPatient if necessary and not already mapped
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
        console.error('Error fetching patient for sidebar:', error);
      }
      setLoading(false);
    };
    if (id) fetchPatient();
    else setPatient(null);
  }, [id]);

  if (!id) return (
    <div className={`text-gray-100 bg-[#1a365d] h-full p-4 text-center ${isCollapsed ? 'w-12' : 'w-full'}`}>
      No patient selected
    </div>
  );
  
  if (loading) return (
    <div className={`text-gray-100 bg-[#1a365d] h-full p-4 text-center ${isCollapsed ? 'w-12' : 'w-full'}`}>
      Loading...
    </div>
  );
  
  if (!patient) return (
    <div className={`text-red-200 bg-[#1a365d] h-full p-4 text-center ${isCollapsed ? 'w-12' : 'w-full'}`}>
      Patient not found
    </div>
  );

  // Format Gender initial and Age
  const genderInitial = patient.gender ? patient.gender.charAt(0).toUpperCase() : '';
  const formattedPatientInfo = `${patient.name} (${genderInitial} ${patient.age})`;

  // Navigation items component (empty for now)
  const renderNavigationItems = () => null;

  return (
    <aside 
      className={`bg-[#1a365d] text-white h-screen overflow-y-auto text-xs transition-all duration-200 ${
        isCollapsed ? 'w-12' : 'w-full max-w-xs'
      }`}
    >
      <div className="flex flex-col items-center">
        {!isCollapsed && (
          <>
            {/* Avatar Placeholder */}
            <div className="w-16 h-16 rounded-full bg-[#2c5282] flex items-center justify-center mb-2 mt-4">
              <User className="w-10 h-10 text-blue-200" />
            </div>
            {/* Patient Name (Gender Age) */}
            <div className="text-sm font-semibold text-center mb-4 text-white">{formattedPatientInfo}</div>
          </>
        )}
        
        {/* Navigation Items */}
        {renderNavigationItems()}

        {!isCollapsed && (
          <>
            <div className="mb-2 px-4 w-full">
              {/* Patient ID with Icon */}
              <div className="flex items-center text-blue-100">
                <CreditCard className="mr-2 h-4 w-4 flex-shrink-0 text-blue-200" />
                <span className="truncate">{patient.DFN}</span>
              </div>
              {/* Mobile No. with Icon */}
              <div className="flex items-center text-blue-100">
                <Phone className="mr-2 h-4 w-4 flex-shrink-0 text-blue-200" />
                <span className="truncate">{patient["Mobile No"]}</span>
              </div>
            </div>

            <hr className="my-2 border-[#2c5282] w-full px-4" />

            <div className="mb-4 px-4 w-full text-blue-100">
              <div className="font-semibold mb-2 text-white">Patient Visit / IPD Details</div>
              <div className="flex items-center gap-2 mb-1">
                <BedDouble className="h-4 w-4 flex-shrink-0 text-blue-200" />
                <span className="truncate">{patient.Ward} - {patient.Bed}</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="h-4 w-4 flex-shrink-0 text-blue-200" />
                <span className="truncate">{patient["Admission Date"]}</span>
              </div>
              <div className="mb-1">
                <span className="font-semibold text-blue-200">LOS:</span> {patient.LOS}
              </div>
              <div className="mb-1">
                <span className="font-semibold text-blue-200">Primary Consultant:</span> {patient["Primary Consultant"]}
              </div>
              <div className="mb-1">
                <span className="font-semibold text-blue-200">Encounter Provider:</span> {patient["Treating Consultant"]}
              </div>
            </div>
            <hr className="my-2 border-[#2c5282] w-full px-4" />
            <div className="mb-4 px-4 w-full text-blue-100">
              <div className="font-semibold mb-2 text-white">Patient Clinical Details</div>
              <div className="mb-1"><span className="font-semibold text-blue-200">Final Diagnosis:</span> {patient.finalDiagnosis}</div>
              <div className="mb-1"><span className="font-semibold text-blue-200">Posting:</span> {patient.posting}</div>
              <div className="mb-1"><span className="font-semibold text-blue-200">Reason For Visit:</span> {patient.reasonForVisit}</div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}