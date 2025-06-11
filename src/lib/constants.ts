// @/lib/constants.ts
import type { LucideIcon } from 'lucide-react'
import type { ChartConfig } from '@/components/ui/chart'
import {
  Clock,
  Pill as PillIcon,
  Plus,
  Edit3,
  FileText,
  Ban,
  ScanLine,
  ClipboardList,
  BellRing,
  Droplet,
  HeartPulse,
  Activity,
  Thermometer,
  Scale,
  User,
  Hospital,
  CalendarDays,
  Phone,
  BedDouble,
  BriefcaseMedical,
  FileQuestion,
} from 'lucide-react'

export type ProblemCategory = 'Common Problems' | 'Other'
export type ProblemStatus = 'ACTIVE' | 'RESOLVED'
export type ProblemImmediacy = 'Unknown' | 'Acute' | 'Chronic'
export type ProblemService = string

export interface HealthMetric {
  name: string
  value: string
  unit: string
  icon: LucideIcon
  tabValue: string
  activeColor?: string
}

export interface Problem {
  id: string
  description: string
  dateOnset?: string
  status?: ProblemStatus
  category?: ProblemCategory
  immediacy?: ProblemImmediacy
  service?: ProblemService
  notes?: string
}

export interface Medication {
  id: string
  name: string
  reason?: string
  amount?: string
  timing?: string
  status: 'Active' | 'Discontinued'
}

export interface Appointment {
  id: string
  doctor: string
  specialty: string
  date: string
  time: string
}

export interface Patient {
  id: string
  name: string
  avatarUrl: string
  gender: string
  age: number
  dob: string
  wardNo: string
  bedDetails: string
  admissionDate: string
  lengthOfStay: string
  mobile: string
  primaryConsultant: string
  specialty: string
  encounterProvider: string
  finalDiagnosis: string
  posting: string
  reasonForVisit: string
  ssn: string
  "Admission Date": string
  "IP No": number
  "Mobile No": number
  "Primary Consultant": string
  "Secondary Consultant": string
  "Treating Consultant": string
  
  // Aliases for backward compatibility
  Age: string | number
  Bed: string
  DFN: number
  DOB: string
  Gender: string
  LOS: string
  Name: string
  Specialty: string
  Ward: string
}

export const MOCK_PROBLEMS: Problem[] = [
  { id: 'prob1', description: 'Chronic Hypertension' },
  { id: 'prob2', description: 'Type 2 Diabetes Mellitus' },
  { id: 'prob3', description: 'Asthma - Intermittent' },
  { id: 'prob4', description: 'Allergic Rhinitis' },
  { id: 'prob5', description: 'Osteoarthritis' },
]

export const MOCK_MEDICATIONS: Medication[] = [
  { id: '1', name: 'UltraVit OMEGA + DHA', reason: 'Heart', amount: '1x2', timing: 'before eating', status: 'Active' },
  { id: '2', name: 'Clopidogrel', reason: 'Heart', amount: '2x1', timing: 'after eating', status: 'Active' },
  { id: '3', name: 'Ticagrelor', reason: 'Heart', amount: '3x/3', timing: 'after eating', status: 'Active' },
  { id: '4', name: 'Aspirin', reason: 'Pain Relief', amount: '1 tablet', timing: 'as needed', status: 'Discontinued' },
  { id: '5', name: 'Metformin', reason: 'Diabetes', amount: '500mg', timing: 'twice daily', status: 'Active' },
]

export const pageCardSampleContent: Record<string, string[]> = {
  Allergies: ['Pollen', 'Dust Mites', 'Peanuts', 'Shellfish', 'Penicillin', 'Latex'],
  'Medications History': ['Aspirin', 'Lisinopril'],
  Report: ['Pathology Report: Pending', 'Imaging: Stable', 'Consult: Cardiology', 'Discharge Summary', 'Operative: Appendectomy', 'Blood Work: Normal'],
  Radiology: ['Chest X-Ray: Clear', 'MRI Brain: Normal', 'CT Abdomen: NAD', 'Ultrasound Pelvis: NAD', 'Mammogram: BI-RADS 1', 'Knee X-Ray: Mild OA'],
  'Clinical notes': ['Follow-up in 3 months.', 'Monitor blood pressure.', 'Discussed dietary changes.', 'Patient reports feeling well.', 'Reviewed lab results.', 'Adjusted medication.'],
  'Encounter notes': ['Routine physical exam.', 'Medication review done.', 'Vaccinations up to date.', 'Labs ordered for next visit.', 'Counseled on lifestyle.', 'Patient questions answered.'],
  'Clinical reminder': ['Annual flu shot due.', 'Colonoscopy screening.', 'Mammogram next year.', 'Follow up on labs.', 'Schedule dental check-up.', 'Lipid panel in 6 months.'],
}

export const MOCK_KEY_INDICATORS: HealthMetric[] = [
  { name: 'Blood Glucose', value: '98', unit: 'mg/dL', icon: Droplet, tabValue: 'blood-glucose', activeColor: 'hsl(var(--chart-2))' },
  { name: 'Heart Rate', value: '72', unit: 'bpm', icon: HeartPulse, tabValue: 'heart-rate', activeColor: 'hsl(var(--chart-1))' },
  { name: 'Blood Pressure', value: '120/95', unit: 'mmHg', icon: Activity, tabValue: 'blood-pressure', activeColor: 'hsl(var(--chart-1))' },
  { name: 'Body Temperature', value: '108', unit: 'F', icon: Thermometer, tabValue: 'body-temperature', activeColor: 'hsl(var(--chart-4))' },
  { name: 'Weight', value: '70', unit: 'kg', icon: Scale, tabValue: 'weight', activeColor: 'hsl(var(--chart-5))' },
]

export const MOCK_HEART_RATE_MONITOR_DATA: Array<{ time: string; hr: number }> = [
  { time: '0s', hr: 75 },
  { time: '1s', hr: 78 },
  { time: '2s', hr: 72 },
  { time: '3s', hr: 80 },
  { time: '4s', hr: 77 },
  { time: '5s', hr: 75 },
  { time: '6s', hr: 79 },
  { time: '7s', hr: 76 },
]

export const MOCK_HEART_RATE_MONITOR_CHART_CONFIG: ChartConfig = { hr: { label: 'Heart Rate (bpm)', color: 'hsl(var(--chart-1))' } }

export const MOCK_GLUCOSE_DATA: Array<{ date: string; level: number }> = [
  { date: 'Mon', level: 95 },
  { date: 'Tue', level: 102 },
  { date: 'Wed', level: 98 },
  { date: 'Thu', level: 110 },
  { date: 'Fri', level: 105 },
  { date: 'Sat', level: 99 },
  { date: 'Sun', level: 108 },
]

export const MOCK_BLOOD_PRESSURE_DATA: Array<{ date: string; systolic: number; diastolic: number }> = [
  { date: 'Mon', systolic: 120, diastolic: 80 },
  { date: 'Tue', systolic: 122, diastolic: 82 },
  { date: 'Wed', systolic: 118, diastolic: 78 },
  { date: 'Thu', systolic: 125, diastolic: 85 },
  { date: 'Fri', systolic: 120, diastolic: 80 },
  { date: 'Sat', systolic: 123, diastolic: 81 },
  { date: 'Sun', systolic: 119, diastolic: 79 },
]

export const MOCK_BODY_TEMPERATURE_DATA: Array<{ date: string; temp: number }> = [
  { date: 'Mon', temp: 98.6 },
  { date: 'Tue', temp: 99.0 },
  { date: 'Wed', temp: 98.2 },
  { date: 'Thu', temp: 98.8 },
  { date: 'Fri', temp: 98.5 },
  { date: 'Sat', temp: 99.1 },
  { date: 'Sun', temp: 98.7 },
]

export const MOCK_WEIGHT_DATA: Array<{ date: string; weight: number }> = [
  { date: 'Mon', weight: 70.0 },
  { date: 'Tue', weight: 70.2 },
  { date: 'Wed', weight: 69.8 },
  { date: 'Thu', weight: 70.1 },
  { date: 'Fri', weight: 69.9 },
  { date: 'Sat', weight: 70.3 },
  { date: 'Sun', weight: 70.0 },
]

export const MOCK_PATIENT: Patient = {
  id: 'pat123',
  name: 'Sarah Miller',
  avatarUrl: '',
  gender: 'Female',
  age: 42,
  dob: '1982-03-15',
  wardNo: 'C-305',
  bedDetails: 'Bed A',
  admissionDate: '2024-07-15',
  lengthOfStay: '5 days',
  mobile: '+1-555-0102',
  primaryConsultant: 'Dr. Emily Carter',
  specialty: 'Cardiology',
  encounterProvider: 'City General Hospital',
  finalDiagnosis: 'Acute Bronchitis',
  posting: 'General Medicine',
  reasonForVisit: 'Routine Check-up & Consultation',
  ssn: '123-45-6789',
  "Admission Date": '2024-07-15',
  Age: '42',
  Bed: 'A',
  DFN: 123456789,
  DOB: '1982-03-15',
  Gender: 'Female',
  "IP No": 123456789,
  LOS: '5 days',
  "Mobile No": 5550102,
  Name: 'Sarah Miller',
  "Primary Consultant": 'Dr. Emily Carter',
  "Secondary Consultant": '',
  Specialty: 'Cardiology',
  "Treating Consultant": 'Dr. Emily Carter',
  Ward: 'C-305',
}