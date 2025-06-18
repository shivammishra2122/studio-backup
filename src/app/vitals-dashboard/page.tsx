'use client';

import type { NextPage } from 'next';
import React, { useState, useEffect, useCallback } from 'react';

type vitalSign
 = {
  id: string;
  date: string;
  bloodPressure: string | null;
  temperature: string | null;
  pulse: string | null;
  respiration: string | null;
  height: string | null;
  weight: string | null;
  cvp: string | null;
  cg: string | null;
  pulseOximetry: string | null;
  pain: string | null;
  earlyWarningSign: string | null;
  location: string;
  enteredBy: string;
  [key: string]: any; // Allow string indexing
};

interface VitalApiResponse {
  [key: string]: {
    VitalDateTime: string;
    VitalFlag: number;
    VitalName: string;
    VitalType: number;
    VitalValue: string | number;
  };
}

interface VitalData {
  id: string;
  date: string;
  name: string;
  type: number;
  value: string | number;
  flag: number;
}

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Problem } from '@/hooks/usePatientProblems';

// Custom TableRow without hover effect for vitals entry
const VitalsTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b",
      className
    )}
    {...props}
  />
));
VitalsTableRow.displayName = "VitalsTableRow";

import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  Edit3, CalendarDays, RefreshCw, ArrowUpDown, ChevronDown, ChevronUp, 
  Settings, FileEdit, Printer, Download, Filter, Ban,Plus, FileText, PenLine 
} from 'lucide-react';

import { Switch } from "@/components/ui/switch";
import { fetchClinicalNotes, Patient } from '@/services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { usePatientProblems } from '@/hooks/usePatientProblems';
import { usePatientDiagnosis } from '@/hooks/usePatientDiagnosis';
import { usePatientAllergies } from '@/hooks/usePatientAllergies';
import { usePatientComplaints } from '@/hooks/usePatientComplaints';
import { fetchIntakeOutputData, fetchIntakeUpdateData, IntakeOutputSummary } from '@/services/intakeOutput';
import { submitVitalEntry } from '@/services/vitalEntry';

const verticalNavItems = [
  "Vitals", "Intake/Output", "Problems", "Final Diagnosis",
  "Chief-Complaints", "Allergies", "OPD/IPD Details"]

const vitalTypes = [
  "B/P (mmHg)", "Temp (F)", "Resp (/min)", "Pulse (/min)",
  "Height (In)", "Weight (kg)", "CVP (cmH2O)", "C/G (In)",
  "Pulse Oximetry (%)", "Pain", "Early Warning Sign", "Location", "Entered By"
];

type VitalChartDataPoint = { name: string; value?: number; systolic?: number; diastolic?: number };

const getYAxisConfig = (vitalName: string): { label: string; domain: [number | string, number | string] } => {
  switch (vitalName) {
    case "B/P (mmHg)": return { label: "mmHg", domain: [40, 200] };
    case "Temp (F)": return { label: "°F", domain: [95, 105] };
    case "Resp (/min)": return { label: "/min", domain: [0, 40] };
    case "Pulse (/min)": return { label: "bpm", domain: [40, 160] };
    case "Height (In)": return { label: "Inches", domain: [48, 84] };
    case "Weight (kg)": return { label: "kg", domain: [30, 150] };
    case "CVP (cmH2O)": return { label: "cmH2O", domain: [0, 15] };
    case "C/G (In)": return { label: "Inches", domain: [15, 45] };
    case "Pulse Oximetry (%)": return { label: "%", domain: [80, 100] };
    case "Pain": return { label: "Scale 0-10", domain: [0, 10] };
    case "Early Warning Sign": return { label: "Score", domain: [0, 10] };
    default: return { label: "Value", domain: ['auto', 'auto'] };
  }
};

const VitalsView = () => {
  const [visitDateState, setVisitDateState] = useState<string | undefined>("today");
  const [fromDateValue, setFromDateValue] = useState<string>("");
  const [toDateValueState, setToDateValueState] = useState<string>("");
  const [selectedVitalForGraph, setSelectedVitalForGraph] = useState<string>("Temp (F)");
  const [chartData, setChartData] = useState<VitalChartDataPoint[]>([]);
  const [isEnteredInError, setIsEnteredInError] = useState<boolean>(false);
  const [isVitalsEntryMode, setIsVitalsEntryMode] = useState<boolean>(false);
  const [vitalsEntryData, setVitalsEntryData] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    bloodPressureNotRecordable: false,
    bloodPressureQualifier: undefined as string | undefined,
    heightValue: '',
    heightUnit: 'cm',
    heightQualifier: undefined as string | undefined,
    painValue: undefined as string | undefined,
    pulseValue: '',
    pulseQualifier: undefined as string | undefined,
    respirationValue: '',
    respirationQualifier: undefined as string | undefined,
    temperatureValue: '',
    temperatureUnit: 'F',
    temperatureSite: undefined as string | undefined,
    temperatureQualifier: undefined as string | undefined,
    weightValue: '',
    weightUnit: 'kg',
    weightQualifier: undefined as string | undefined,
    cvpValue: '',
    cvpUnit: 'mmHg',
    cgValue: '',
    cgUnit: 'cm',
    cgQualifier: undefined as string | undefined,
    pulseOximetryValue: '',
    pulseOximetryQualifier: undefined as string | undefined,
  });
  const [vitalsData, setVitalsData] = useState<VitalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEntries, setShowEntries] = useState<string>("10");
  const [dateRange, setDateRange] = useState<[number, number]>([0, 7]);

  const yAxisConfig = getYAxisConfig(selectedVitalForGraph);

  const handleVitalsEntryChange = (field: keyof typeof vitalsEntryData, value: string | boolean | undefined) => {
    setVitalsEntryData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Format the vitals data for the API
      const formattedData = {
        PatientSSN: "210099218", // This should come from the patient context
        IPNo: "153381", // This should come from the patient context
        EntredID: "",
        Temperature: vitalsEntryData.temperatureValue ? `${vitalsEntryData.temperatureValue}°${vitalsEntryData.temperatureUnit}` : "",
        Pulse: vitalsEntryData.pulseValue || "",
        Respiration: vitalsEntryData.respirationValue || "",
        BloodPressure: vitalsEntryData.bloodPressureSystolic && vitalsEntryData.bloodPressureDiastolic 
          ? `${vitalsEntryData.bloodPressureSystolic}/${vitalsEntryData.bloodPressureDiastolic}` 
          : "",
        Weight: vitalsEntryData.weightValue ? `${vitalsEntryData.weightValue}${vitalsEntryData.weightUnit}` : "",
        OxygenSaturation: vitalsEntryData.pulseOximetryValue || "",
        Pain: vitalsEntryData.painValue || "1",
        ReasonEntredError: isEnteredInError ? "1" : "2",
        EntredUserID: "20407", // This should come from the auth context
        Height: vitalsEntryData.heightValue ? `${vitalsEntryData.heightValue}${vitalsEntryData.heightUnit}` : "",
        CVP: vitalsEntryData.cvpValue || "",
        CG: vitalsEntryData.cgValue || "",
      };

      const response = await submitVitalEntry(formattedData);
      
      if (response.succeeded) {
        // Show success message
        alert('Vitals submitted successfully!');
        // Reset form
        setVitalsEntryData({
          bloodPressureSystolic: '',
          bloodPressureDiastolic: '',
          bloodPressureNotRecordable: false,
          bloodPressureQualifier: undefined,
          heightValue: '',
          heightUnit: 'cm',
          heightQualifier: undefined,
          painValue: undefined,
          pulseValue: '',
          pulseQualifier: undefined,
          respirationValue: '',
          respirationQualifier: undefined,
          temperatureValue: '',
          temperatureUnit: 'F',
          temperatureSite: undefined,
          temperatureQualifier: undefined,
          weightValue: '',
          weightUnit: 'kg',
          weightQualifier: undefined,
          cvpValue: '',
          cvpUnit: 'mmHg',
          cgValue: '',
          cgUnit: 'cm',
          cgQualifier: undefined,
          pulseOximetryValue: '',
          pulseOximetryQualifier: undefined,
        });
        setIsEnteredInError(false);
        setIsVitalsEntryMode(false);
        // Refresh vitals data
        fetchVitalsData();
      } else {
        throw new Error('Failed to submit vitals');
      }
    } catch (error) {
      console.error('Error submitting vitals:', error);
      alert('Failed to submit vitals. Please try again.');
    }
  };

  const fetchVitalsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://3.6.230.54:4003/api/apiVitalView.sh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          UserName: 'CPRS-UAT',
          Password: 'UAT@123',
          PatientSSN: '671106286',
          DUZ: '115'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: VitalApiResponse = await response.json();
      console.log('API Response:', data);
      
      // Transform API response to our VitalData array
      const transformedData: VitalData[] = Object.entries(data).map(([key, value]) => ({
        id: key,
        date: value.VitalDateTime || new Date().toISOString(),
        name: value.VitalName,
        type: value.VitalType,
        value: value.VitalValue,
        flag: value.VitalFlag
      }));

      console.log('Transformed Vitals Data:', transformedData);
      setVitalsData(transformedData);
      
      // Set default selected vital if not already set or if we have data now
      if (transformedData.length > 0) {
        const tempVital = transformedData.find(v => v.name === 'Temp');
        if (tempVital) {
          setSelectedVitalForGraph('Temp');
        } else if (!selectedVitalForGraph) {
          setSelectedVitalForGraph(transformedData[0].name);
        }
      }
    } catch (err) {
      console.error('Error fetching vitals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch vitals');
    } finally {
      setLoading(false);
    }
  }, [selectedVitalForGraph]);

  const handleVitalRowClick = (vitalName: string) => {
    console.log('Vital selected:', vitalName);
    setSelectedVitalForGraph(vitalName);
    
    if (vitalsData.length === 0) {
      setChartData([]);
      return;
    }
    
    // Filter and map data for the selected vital
    const selectedVitalData = vitalsData
      .filter(vital => vital.name === vitalName && vital.value !== undefined)
      .map((vital, index) => {
        let numericValue: number | null = null;
        
        // Extract numeric value from the VitalValue string
        if (typeof vital.value === 'string') {
          const match = String(vital.value).match(/(\d+\.?\d*)/);
          if (match) {
            numericValue = parseFloat(match[0]);
          }
        } else if (typeof vital.value === 'number') {
          numericValue = vital.value;
        }
        
        return {
          name: `Record ${index + 1}`,
          value: numericValue !== null && !isNaN(numericValue) ? numericValue : 0,
          date: vital.date,
          rawValue: vital.value
        };
      });
    
    console.log('Chart data for', vitalName, ':', selectedVitalData);
    setChartData(selectedVitalData);
  };

  useEffect(() => {
    fetchVitalsData();
  }, [fetchVitalsData]);

  useEffect(() => {
    if (vitalsData.length > 0 && selectedVitalForGraph) {
      const selectedVitalData = vitalsData
        .filter(vital => vital.name === selectedVitalForGraph && vital.value !== undefined)
        .map((vital, index) => {
          let numericValue: number | null = null;
          
          if (typeof vital.value === 'string') {
            const match = String(vital.value).match(/(\d+\.?\d*)/);
            if (match) {
              numericValue = parseFloat(match[0]);
            }
          } else if (typeof vital.value === 'number') {
            numericValue = vital.value;
          }
          
          return {
            name: `Record ${index + 1}`,
            value: numericValue !== null && !isNaN(numericValue) ? numericValue : 0,
            date: vital.date,
            rawValue: vital.value
          };
        });
      
      console.log('Initial chart data for', selectedVitalForGraph, ':', selectedVitalData);
      setChartData(selectedVitalData);
    }
  }, [vitalsData, selectedVitalForGraph]);

  const formatDate = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).toUpperCase();
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 w-full h-full">
      <div className="flex-1 min-w-0 flex flex-col border rounded-md bg-card shadow">
        <div className="flex items-center justify-between py-1.5 px-3 border-b bg-card text-foreground rounded-t-md">
          <h2 className="text-sm font-medium">{isVitalsEntryMode ? "Vitals Entry" : "Vitals"}</h2>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-muted/50" onClick={() => setIsVitalsEntryMode(!isVitalsEntryMode)}>
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {isVitalsEntryMode ? (
          <>
            <ScrollArea className="flex-1 min-h-0 flex flex-col">
              <Table className="text-xs">
                <TableHeader className="sticky top-0 z-0">
                  <VitalsTableRow className="bg-blue-900">
                    <TableHead className="text-white font-semibold py-2 px-3 h-8 border-r border-blue-800">Vitals</TableHead>
                    <TableHead className="text-white font-semibold py-2 px-3 h-8 border-r border-blue-800">Not Recordable</TableHead>
                    <TableHead className="text-white font-semibold py-2 px-3 h-8 border-r border-blue-800">Value</TableHead>
                    <TableHead className="text-white font-semibold py-2 px-3 h-8 border-r border-blue-800">Unit</TableHead>
                    <TableHead className="text-white font-semibold py-2 px-3 h-8">Qualifiers</TableHead>
                  </VitalsTableRow>
                </TableHeader>
                <TableBody>
                  <VitalsTableRow className="bg-muted/30">
                    <TableCell className="py-1.5 px-3">B/P</TableCell>
                    <TableCell className="py-1.5 px-3">
                      <Checkbox id="bpNotRecordable" checked={vitalsEntryData.bloodPressureNotRecordable} onCheckedChange={(checked) => handleVitalsEntryChange('bloodPressureNotRecordable', Boolean(checked))} className="h-3.5 w-3.5" />
                    </TableCell>
                    <TableCell className="py-1.5 px-3">
                      <div className="flex items-center gap-1">
                        <Input type="text" placeholder="SYS" className="h-7 text-xs w-12" value={vitalsEntryData.bloodPressureSystolic} onChange={e => handleVitalsEntryChange('bloodPressureSystolic', e.target.value)} />
                        <span className="mx-0.5">/</span>
                        <Input type="text" placeholder="DIA" className="h-7 text-xs w-12" value={vitalsEntryData.bloodPressureDiastolic} onChange={e => handleVitalsEntryChange('bloodPressureDiastolic', e.target.value)} />
                      </div>
                    </TableCell>
                    <TableCell className="py-1.5 px-3">mmHg</TableCell>
                    <TableCell className="py-1.5 px-3">
                      <Select value={vitalsEntryData.bloodPressureQualifier} onValueChange={val => handleVitalsEntryChange('bloodPressureQualifier', val)}>
                        <SelectTrigger className="h-7 text-xs w-28"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sitting" className="text-xs">Sitting</SelectItem>
                          <SelectItem value="standing" className="text-xs">Standing</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </VitalsTableRow>
                  <VitalsTableRow className="hover:bg-transparent">
                    <TableCell className="py-1.5 px-3">Temp</TableCell>
                    <TableCell className="py-1.5 px-3"></TableCell>
                    <TableCell className="py-1.5 px-3">
                      <Input type="text" className="h-7 text-xs w-20" value={vitalsEntryData.temperatureValue} onChange={e => handleVitalsEntryChange('temperatureValue', e.target.value)} />
                    </TableCell>
                    <TableCell className="py-1.5 px-3">
                      <Select value={vitalsEntryData.temperatureUnit} onValueChange={val => handleVitalsEntryChange('temperatureUnit', val)}>
                        <SelectTrigger className="h-7 text-xs w-20"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="F" className="text-xs">F</SelectItem>
                          <SelectItem value="C" className="text-xs">C</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="py-1.5 px-3">
                      <Select value={vitalsEntryData.temperatureQualifier} onValueChange={val => handleVitalsEntryChange('temperatureQualifier', val)}>
                        <SelectTrigger className="h-7 text-xs w-28"><SelectValue placeholder="Site" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="oral" className="text-xs">Oral</SelectItem>
                          <SelectItem value="axillary" className="text-xs">Axillary</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </VitalsTableRow>
                  <VitalsTableRow className="bg-muted/30">
                    <TableCell className="py-1.5 px-3">Pain</TableCell>
                    <TableCell className="py-1.5 px-3"></TableCell>
                    <TableCell className="py-1.5 px-3">
                      <Select value={vitalsEntryData.painValue} onValueChange={val => handleVitalsEntryChange('painValue', val)}>
                        <SelectTrigger className="h-7 text-xs w-24"><SelectValue placeholder="Scale 0-10" /></SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 11 }, (_, i) => <SelectItem key={i} value={i.toString()} className="text-xs">{i}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="py-1.5 px-3"></TableCell>
                    <TableCell className="py-1.5 px-3"></TableCell>
                  </VitalsTableRow>
                  <TableRow>
                    <TableCell className="py-1.5 px-3">Pulse</TableCell>
                    <TableCell className="py-1.5 px-3"></TableCell>
                    <TableCell className="py-1.5 px-3">
                      <Input type="text" className="h-7 text-xs w-20" value={vitalsEntryData.pulseValue} onChange={e => handleVitalsEntryChange('pulseValue', e.target.value)} />
                    </TableCell>
                    <TableCell className="py-1.5 px-3">/min</TableCell>
                    <TableCell className="py-1.5 px-3">
                      <Select value={vitalsEntryData.pulseQualifier} onValueChange={val => handleVitalsEntryChange('pulseQualifier', val)}>
                        <SelectTrigger className="h-7 text-xs w-28"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular" className="text-xs">Regular</SelectItem>
                          <SelectItem value="irregular" className="text-xs">Irregular</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/30">
                    <TableCell className="py-1.5 px-3">Height</TableCell>
                    <TableCell className="py-1.5 px-3"></TableCell>
                    <TableCell className="py-1.5 px-3">
                      <Input type="text" className="h-7 text-xs w-20" value={vitalsEntryData.heightValue} onChange={e => handleVitalsEntryChange('heightValue', e.target.value)} />
                    </TableCell>
                    <TableCell className="py-1.5 px-3">
                      <Select value={vitalsEntryData.heightUnit} onValueChange={val => handleVitalsEntryChange('heightUnit', val)}>
                        <SelectTrigger className="h-7 text-xs w-20"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cm" className="text-xs">cm</SelectItem>
                          <SelectItem value="in" className="text-xs">in</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="py-1.5 px-3">
                      <Select value={vitalsEntryData.heightQualifier} onValueChange={val => handleVitalsEntryChange('heightQualifier', val)}>
                        <SelectTrigger className="h-7 text-xs w-28"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standing" className="text-xs">Standing</SelectItem>
                          <SelectItem value="lying" className="text-xs">Lying</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="py-1.5 px-3">Weight</TableCell>
                    <TableCell className="py-1.5 px-3"></TableCell>
                    <TableCell className="py-1.5 px-3">
                      <Input type="text" className="h-7 text-xs w-20" value={vitalsEntryData.weightValue} onChange={e => handleVitalsEntryChange('weightValue', e.target.value)} />
                    </TableCell>
                    <TableCell className="py-1.5 px-3">
                      <Select value={vitalsEntryData.weightUnit} onValueChange={val => handleVitalsEntryChange('weightUnit', val)}>
                        <SelectTrigger className="h-7 text-xs w-20"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg" className="text-xs">kg</SelectItem>
                          <SelectItem value="lbs" className="text-xs">lbs</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="py-1.5 px-3">
                      <Select value={vitalsEntryData.weightQualifier} onValueChange={val => handleVitalsEntryChange('weightQualifier', val)}>
                        <SelectTrigger className="h-7 text-xs w-28"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="actual" className="text-xs">Actual</SelectItem>
                          <SelectItem value="estimated" className="text-xs">Estimated</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/30">
                    <TableCell className="py-1.5 px-3">CVP</TableCell>
                    <TableCell className="py-1.5 px-3"></TableCell>
                    <TableCell className="py-1.5 px-3">
                      <Input type="text" className="h-7 text-xs w-20" value={vitalsEntryData.cvpValue} onChange={e => handleVitalsEntryChange('cvpValue', e.target.value)} />
                    </TableCell>
                    <TableCell className="py-1.5 px-3">cmH2O</TableCell>
                    <TableCell className="py-1.5 px-3"></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="py-1.5 px-3">C/G</TableCell>
                    <TableCell className="py-1.5 px-3"></TableCell>
                    <TableCell className="py-1.5 px-3">
                      <Input type="text" className="h-7 text-xs w-20" value={vitalsEntryData.cgValue} onChange={e => handleVitalsEntryChange('cgValue', e.target.value)} />
                    </TableCell>
                    <TableCell className="py-1.5 px-3">cm</TableCell>
                    <TableCell className="py-1.5 px-3">
                      <Select value={vitalsEntryData.cgQualifier} onValueChange={val => handleVitalsEntryChange('cgQualifier', val)}>
                        <SelectTrigger className="h-7 text-xs w-28"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="head" className="text-xs">Head</SelectItem>
                          <SelectItem value="chest" className="text-xs">Chest</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/30">
                    <TableCell className="py-1.5 px-3">Pulse Oximetry</TableCell>
                    <TableCell className="py-1.5 px-3"></TableCell>
                    <TableCell className="py-1.5 px-3">
                      <Input type="text" className="h-7 text-xs w-20" value={vitalsEntryData.pulseOximetryValue} onChange={e => handleVitalsEntryChange('pulseOximetryValue', e.target.value)} />
                    </TableCell>
                    <TableCell className="py-1.5 px-3">%</TableCell>
                    <TableCell className="py-1.5 px-3">
                      <Select value={vitalsEntryData.pulseOximetryQualifier} onValueChange={val => handleVitalsEntryChange('pulseOximetryQualifier', val)}>
                        <SelectTrigger className="h-7 text-xs w-28"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="room-air" className="text-xs">Room Air</SelectItem>
                          <SelectItem value="oxygen" className="text-xs">Oxygen</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="py-1.5 px-3">Respiration</TableCell>
                    <TableCell className="py-1.5 px-3"></TableCell>
                    <TableCell className="py-1.5 px-3">
                      <Input type="text" className="h-7 text-xs w-20" value={vitalsEntryData.respirationValue} onChange={e => handleVitalsEntryChange('respirationValue', e.target.value)} />
                    </TableCell>
                    <TableCell className="py-1.5 px-3">/min</TableCell>
                    <TableCell className="py-1.5 px-3">
                      <Select value={vitalsEntryData.respirationQualifier} onValueChange={val => handleVitalsEntryChange('respirationQualifier', val)}>
                        <SelectTrigger className="h-7 text-xs w-28"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular" className="text-xs">Regular</SelectItem>
                          <SelectItem value="irregular" className="text-xs">Irregular</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/30">
                    <TableCell className="py-1.5 px-3">Entered in Error</TableCell>
                    <TableCell className="py-1.5 px-3">
                      <Switch checked={isEnteredInError} onCheckedChange={setIsEnteredInError} />
                    </TableCell>
                    <TableCell className="py-1.5 px-3" colSpan={3}>Mark this vital as entered in error.</TableCell>
                  </TableRow>

                </TableBody>
              </Table>
            </ScrollArea>
            <div className="p-3 border-t flex justify-end space-x-2">
              <Button 
                variant="secondary" 
                className="text-xs"
                type="button"
                onClick={() => setIsVitalsEntryMode(false)}
              >
                Cancel
              </Button>
              <Button 
                className="text-xs" 
                type="button"
                onClick={handleSubmitVitals}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Vitals'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 flex flex-col overflow-auto p-3 no-scrollbar">
              <div className="mb-2 text-xs">
                <div className="flex flex-nowrap items-center justify-between w-full gap-3">
                  <div className="flex items-center gap-3">
                    <Select value={visitDateState} onValueChange={(value) => {
                      setVisitDateState(value);
                      // Set default date ranges based on selection
                      if (value === 'today') setDateRange([0, 0]);
                      if (value === 'yesterday') setDateRange([1, 1]);
                      if (value === 'week') setDateRange([0, 7]);
                      if (value === 'month') setDateRange([0, 30]);
                    }}>
                      <SelectTrigger className="h-7 w-28 text-xs">
                        <SelectValue placeholder="Last 7 days" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today" className="text-xs">Today</SelectItem>
                        <SelectItem value="yesterday" className="text-xs">Yesterday</SelectItem>
                        <SelectItem value="week" className="text-xs">This Week</SelectItem>
                        <SelectItem value="month" className="text-xs">This Month</SelectItem>
                        <SelectItem value="custom" className="text-xs">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="showEntries" className="text-xs whitespace-nowrap">Show</Label>
                    <Select value={showEntries} onValueChange={setShowEntries}>
                      <SelectTrigger className="h-7 w-16 text-xs">
                        <SelectValue placeholder="10" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10" className="text-xs">10</SelectItem>
                        <SelectItem value="25" className="text-xs">25</SelectItem>
                        <SelectItem value="50" className="text-xs">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <Label htmlFor="showEntries" className="text-xs whitespace-nowrap">entries</Label>
                  </div>
                </div>
              </div>

              {/* Vitals Table */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <Table className="text-xs w-full">
                  <TableHeader className="bg-accent sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="py-1 px-3 text-xs h-auto w-1/2">Vital Type</TableHead>
                      <TableHead className="py-1 px-3 text-xs h-auto w-1/4 text-right">Date</TableHead>
                      <TableHead className="py-1 px-3 text-xs h-auto w-1/4 text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          <p className="text-muted-foreground">Loading vitals...</p>
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          <p className="text-destructive">{error}</p>
                        </TableCell>
                      </TableRow>
                    ) : vitalsData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          <p className="text-muted-foreground">No vitals data available</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      // Group vitals by name to show only the latest entry for each vital type
                      Object.entries(
                        vitalsData.reduce((acc, vital) => {
                          if (!acc[vital.name] || new Date(acc[vital.name].date) < new Date(vital.date)) {
                            acc[vital.name] = vital;
                          }
                          return acc;
                        }, {} as Record<string, VitalData>)
                      ).map(([name, vital], index) => {
                        const isSelected = selectedVitalForGraph === name;
                        
                        return (
                          <TableRow 
                            key={`${name}-${index}`}
                            className={`${index % 2 === 0 ? 'bg-muted/30' : ''} ${
                              isSelected ? 'ring-2 ring-primary' : 'cursor-pointer hover:bg-accent/50'
                            }`}
                            onClick={() => handleVitalRowClick(name)}
                          >
                            <TableCell className="py-2 px-3 font-medium">{name}</TableCell>
                            <TableCell className="py-2 px-3 text-right text-xs">
                              {vital.date ? 
                              (vital.date) : '-'}
                            </TableCell>
                            <TableCell className="py-2 px-3 text-right font-medium">
                              {vital.flag === 1 && <span className="text-red-500 mr-1">*</span>}
                              {String(vital.value)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end space-x-2 mt-auto p-2 border-t">
                <Button size="sm" className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground h-8" onClick={() => setIsVitalsEntryMode(true)}>Vitals Entry</Button>
                <Button size="sm" className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground h-8">Multiple Vitals Graph</Button>
                <Button size="sm" className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground h-8">ICU Flow Sheet</Button>
              </div>
              </div>
            </>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col border rounded-md bg-card shadow">
          <div className="flex items-center p-2 border-b bg-card text-foreground rounded-t-md">
            <h2 className="text-base font-semibold">{selectedVitalForGraph} Graph</h2>
          </div>
          <div className="flex-1 min-w-0 flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Loading chart data...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-destructive">Error loading chart: {error}</p>
            </div>
          ) : chartData.length > 0 ? (
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    label={{ value: getYAxisConfig(selectedVitalForGraph).label, angle: -90, position: 'insideLeft' }}
                    domain={getYAxisConfig(selectedVitalForGraph).domain}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value: any) => [value, selectedVitalForGraph]}
                    labelFormatter={(name) => `Record: ${name}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    name={selectedVitalForGraph}
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">No data available for the selected vital</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const IntakeOutputView = () => {
  const [fromDateValue, setFromDateValue] = useState<string>("05/16/2025 14:05");
  const [toDateValueState, setToDateValueState] = useState<string>("05/17/2025 14:05");
  const [isIntakeOutputEntryMode, setIsIntakeOutputEntryMode] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<string>('summary');
  
  // State for API data and loading states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [chartData, setChartData] = useState<Array<{name: string, series1: number, series2: number}>>([]);
  const [intakeOutputData, setIntakeOutputData] = useState<IntakeOutputSummary | null>(null);
  const [useUpdateData, setUseUpdateData] = useState<boolean>(false);

  // Define a type for the intake/output data
  type IntakeOutputData = {
    ivfluid: string;
    bloodproduct: string;
    po: string;
    tubefeeding: string;
    infusion: string;
    other: string;
    urine: string;
    ng: string;
    emesis: string;
    drainage: string;
    faeces: string;
    [key: string]: string; // Index signature to allow string indexing
  };

  const [intakeOutputEntryData, setIntakeOutputEntryData] = useState<IntakeOutputData>({
    ivfluid: '',
    bloodproduct: '',
    po: '',
    tubefeeding: '',
    infusion: '',
    other: '',
    urine: '',
    ng: '',
    emesis: '',
    drainage: '',
    faeces: ''
  });

  const inputHeaders = ["IV FLUID", "BLOOD PRODUCT", "PO", "TUBE FEEDING", "INFUSION", "OTHER"];
  const outputHeaders = ["URINE", "N/G", "EMESIS", "DRAINAGE", "FAECES"];

  const handleIntakeOutputEntryChange = (key: keyof IntakeOutputData, value: string) => {
    setIntakeOutputEntryData(prev => ({ ...prev, [key]: value }));
  };
  
  // Update the intake/output data state when loading is complete
  useEffect(() => {
    if (!loading && intakeOutputData) {
      // Update the chart data when we have new intake/output data
      const newChartData = intakeOutputData.records
        .slice(0, 10) // Limit to last 10 records for the chart
        .map((record: { timestamp: string; type: string; amount: number }) => ({
          name: new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          series1: record.type === 'INTAKE' ? record.amount : 0,
          series2: record.type === 'OUTPUT' ? record.amount : 0,
        }));
      
      setChartData(newChartData);
    }
  }, [loading, intakeOutputData]);

  // Function to load intake/output data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = useUpdateData 
        ? await fetchIntakeUpdateData('670768354')
        : await fetchIntakeOutputData('670768354');
      setIntakeOutputData(data);
      setError(null);
    } catch (err) {
      console.error('Error loading intake/output data:', err);
      setError(err instanceof Error ? err : new Error('Failed to load intake/output data'));
    } finally {
      setLoading(false);
    }
  }, [useUpdateData]);

  // Fetch intake/output data on component mount or when data source changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return dateString; // Return as is if parsing fails
    }
  };

  const IntakeOutputForm = ({ title, isIntake, isUpdate }: { title: string; isIntake: boolean; isUpdate: boolean }) => {
    const [date, setDate] = useState('05/29/2025');
    const [hour, setHour] = useState('10');
    const [minute, setMinute] = useState('32');
    const [second, setSecond] = useState('00');
    const [type, setType] = useState('');
    const [amount, setAmount] = useState('');

    const handleSubmit = () => {
      console.log(`${isUpdate ? 'Update' : 'Add'} ${isIntake ? 'Intake' : 'Output'}`, { date, time: `${hour}:${minute}:${second}`, type, amount });
      setCurrentView('summary');
    };

    const handleReset = () => {
      setDate('05/29/2025');
      setHour('10');
      setMinute('32');
      setSecond('00');
      setType('');
      setAmount('');
    };

    return (
      <div className="flex-1 flex flex-col">
        <div className="p-2 border-b bg-card text-foreground">
          <h2 className="text-base font-semibold">{title}</h2>
        </div>
        <div className="p-4 flex-1 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Label className="text-sm w-24">
              {isIntake ? 'Intake Date' : 'Output Date'} <span className="text-red-500">*</span>
            </Label>
            <div className="flex-1">
              <Input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-8 text-sm"
                placeholder="MM/DD/YYYY"
              />
              <Button variant="ghost" size="icon" className="h-7 w-7 absolute right-0.5 top-0.5 text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Label className="text-sm w-24">
              {isIntake ? 'Intake Time' : 'Output Time'}
            </Label>
            <div className="flex gap-2">
              <Select value={hour} onValueChange={setHour}>
                <SelectTrigger className="w-16 h-8 text-sm">
                  <SelectValue placeholder="HH" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(24)].map((_, i) => (
                    <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                      {i.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={minute} onValueChange={setMinute}>
                <SelectTrigger className="w-16 h-8 text-sm">
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(60)].map((_, i) => (
                    <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                      {i.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={second} onValueChange={setSecond}>
                <SelectTrigger className="w-16 h-8 text-sm">
                  <SelectValue placeholder="SS" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(60)].map((_, i) => (
                    <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                      {i.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Label className="text-sm w-24">
              {isIntake ? 'Intake Type' : 'Output Type'} <span className="text-red-500">*</span>
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-8 text-sm flex-1">
                <SelectValue placeholder="SELECT" />
              </SelectTrigger>
              <SelectContent>
                {(isIntake ? inputHeaders : outputHeaders).map((header) => (
                  <SelectItem key={header} value={header.toLowerCase().replace(' ', '')}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <Label className="text-sm w-24">
              Amount <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-2 flex-1">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-8 text-sm"
                placeholder="Enter amount"
              />
              <span className="text-sm">ml</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-auto p-2 border-t">
          <Button
            size="sm"
            className="text-xs h-8 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleSubmit}
          >
            {isIntake ? (isUpdate ? 'Update Intake' : 'Add Intake') : (isUpdate ? 'Update Output' : 'Output Add')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8"
            onClick={() => setCurrentView('summary')}
          >
            Back
          </Button>
        </div>
      </div>
    );
  };

  const IntakeOutputList = ({ title, isIntake }: { title: string; isIntake: boolean }) => {
    return (
      <div className="flex-1 flex flex-col">
        <div className="p-2 border-b bg-card text-foreground">
          <h2 className="text-base font-semibold">{title}</h2>
        </div>
        <div className="flex flex-wrap items-center space-x-3 p-2 border-b text-xs gap-y-2">
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="12"
              value="1"
              className="w-20"
              title="Select number of months"
              aria-label="Select number of months"
            />
            <span>1 Month</span>
          </div>
          <Label htmlFor="listFromDate" className="shrink-0 text-xs">From Date</Label>
          <div className="relative">
            <Input
              id="listFromDate"
              type="text"
              value={fromDateValue}
              onChange={(e) => setFromDateValue(e.target.value)}
              className="h-8 w-36 text-xs"
            />
            <Button variant="ghost" size="icon" className="h-7 w-7 absolute right-0.5 top-0.5 text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
            </Button>
          </div>
          <Label htmlFor="listToDate" className="shrink-0 text-xs">To Date</Label>
          <div className="relative">
            <Input
              id="listToDate"
              type="text"
              value={toDateValueState}
              onChange={(e) => setToDateValueState(e.target.value)}
              className="h-8 w-36 text-xs"
            />
            <Button variant="ghost" size="icon" className="h-7 w-7 absolute right-0.5 top-0.5 text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs">Show</Label>
            <Select defaultValue="10">
              <SelectTrigger className="w-16 h-8 text-xs">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs">entries</span>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs">Search:</Label>
            <Input className="h-8 w-36 text-xs" placeholder="Search..." />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-accent text-foreground">
                <th className="p-1.5 border font-xs text-center">UPDATE</th>
                <th className="p-1.5 border font-xs text-center">{isIntake ? 'INTAKE DATE/TIME' : 'OUTPUT DATE/TIME'}</th>
                <th className="p-1.5 border font-xs text-center">{isIntake ? 'INTAKE TYPE' : 'OUTPUT TYPE'}</th>
                <th className="p-1.5 border font-xs text-center">HOSPITAL LOCATION</th>
                <th className="p-1.5 border font-xs text-center">AMOUNT</th>
                <th className="p-1.5 border font-xs text-center">ENTER BY</th>
              </tr>
            </thead>
            <tbody className="bg-card">
              <tr>
                <td colSpan={6} className="p-4 text-center">No Data Found</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-2 border-t text-xs">
          <span>Showing 0 to 0 of 0 entries</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-xs h-8">Previous</Button>
            <Button size="sm" variant="outline" className="text-xs h-8">Next</Button>
          </div>
        </div>
        <div className="flex justify-center p-2 border-t">
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8"
            onClick={() => setCurrentView('summary')}
          >
            Back
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 w-[90%] flex justify-between gap-3 overflow-auto">
      <div className="basis-1/2 flex flex-col border rounded-md bg-card shadow overflow-hidden">
        {currentView === 'summary' ? (
          <>
            <div className="flex items-center justify-between p-2 border-b bg-card text-foreground rounded-t-md">
              <h2 className="text-base font-semibold">Patient Intake/Output Summary</h2>
              <div className="flex items-center space-x-1">
                <Button 
                  variant={useUpdateData ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setUseUpdateData(!useUpdateData)}
                >
                  {useUpdateData ? 'Switch to Standard View' : 'Switch to Update View'}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-primary hover:bg-muted/50"
                  onClick={() => {
                    setLoading(true);
                    loadData();
                  }}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-primary hover:bg-muted/50"
                  onClick={() => setIsIntakeOutputEntryMode(!isIntakeOutputEntryMode)}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {isIntakeOutputEntryMode ? (
              <>
                <ScrollArea className="flex-1 min-h-0">
                  <Table className="text-xs">
                    <thead className="bg-accent sticky top-0 z-10">
                      <tr>
                        <TableHead className="text-foreground font-semibold py-2 px-3 h-8">Category</TableHead>
                        <TableHead className="text-foreground font-semibold py-2 px-3 h-8">Value (ml)</TableHead>
                      </tr>
                    </thead>
                    <TableBody>
                      {inputHeaders.map((header, index) => (
                        <TableRow key={header} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                          <TableCell className="py-1.5 px-3">{header}</TableCell>
                          <TableCell className="py-1.5 px-3">
                            <Input
                              type="text"
                              className="h-7 text-xs w-20"
                              value={intakeOutputEntryData[header.toLowerCase().replace(' ', '') as keyof IntakeOutputData]}
                              onChange={e => handleIntakeOutputEntryChange(header.toLowerCase().replace(' ', '') as keyof IntakeOutputData, e.target.value)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                      {outputHeaders.map((header, index) => (
                        <TableRow key={header} className={(index + inputHeaders.length) % 2 === 0 ? 'bg-muted/30' : ''}>
                          <TableCell className="py-1.5 px-3">{header}</TableCell>
                          <TableCell className="py-1.5 px-3">
                            <Input
                              type="text"
                              className="h-7 text-xs w-20"
                              value={intakeOutputEntryData[header.toLowerCase().replace('/', '') as keyof IntakeOutputData]}
                              onChange={e => handleIntakeOutputEntryChange(header.toLowerCase().replace('/', '') as keyof IntakeOutputData, e.target.value)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
                <div className="flex justify-end space-x-2 mt-auto p-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => setIsIntakeOutputEntryMode(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs h-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => {
                      setIsIntakeOutputEntryMode(false);
                      // TODO: Save logic
                    }}
                  >
                    Save
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center space-x-3 p-2 border-b text-xs gap-y-2">
                  <Label htmlFor="intakeFromDate" className="shrink-0 text-xs">From Date</Label>
                  <div className="relative">
                    <Input
                      id="intakeFromDate"
                      type="text"
                      value={fromDateValue}
                      onChange={(e) => setFromDateValue(e.target.value)}
                      className="h-8 w-36 text-xs pr-8"
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7 absolute right-0.5 top-0.5 text-muted-foreground">
                      <CalendarDays className="h-4 w-4" />
                    </Button>
                  </div>
                  <Label htmlFor="intakeToDate" className="shrink-0 text-xs">To Date</Label>
                  <div className="relative">
                    <Input
                      id="intakeToDate"
                      type="text"
                      value={toDateValueState}
                      onChange={(e) => setToDateValueState(e.target.value)}
                      className="h-8 w-36 text-xs pr-8"
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7 absolute right-0.5 top-0.5 text-muted-foreground">
                      <CalendarDays className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-xs border-collapse min-w-[60rem]">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-accent text-foreground">
                        <th colSpan={inputHeaders.length} className="p-2 border text-center font-semibold">Input</th>
                        <th colSpan={outputHeaders.length} className="p-2 border text-center font-semibold">Output</th>
                      </tr>
                      <tr className="bg-accent text-foreground">
                        {inputHeaders.map(header => (
                          <th
                            key={header}
                            className="p-1.5 border font-xs text-center whitespace-nowrap sticky top-8 z-10 bg-accent"
                          >
                            {header.split(" ")[0]}<br />{header.split(" ")[1] || ""}
                          </th>
                        ))}
                        {outputHeaders.map(header => (
                          <th
                            key={header}
                            className="p-1.5 border font-xs text-center whitespace-nowrap sticky top-8 z-10 bg-accent"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-card">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rowNum, index) => (
                        <TableRow 
                          key={`data-row-${rowNum}`}
                          className={`${index % 2 === 0 ? 'bg-muted/30' : ''} hover:bg-muted/50`}
                        >
                          {inputHeaders.map(header => (
                            <TableCell key={`input-data-${header}-${rowNum}`} className="p-1.5 border text-center font-xs h-8">-</TableCell>
                          ))}
                          {outputHeaders.map(header => (
                            <TableCell key={`output-data-${header}-${rowNum}`} className="p-1.5 border text-center h-8">-</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-2 border-t text-xs space-y-1">
                  <div className="flex justify-between"><span>Total Intake Measured:</span><span> ml</span></div>
                  <div className="flex justify-between"><span>Total Output Measured:</span><span> ml</span></div>
                  <div className="flex justify-between"><span>Total Balanced Measured:</span><span> ml</span></div>
                  <div className="text-primary text-center mt-1">M-Morning(08:00-13:59) E-Evening(14:00-19:59) N-Night(20:00-07:59)</div>
                </div>
                <div className="flex items-center justify-center space-x-2 p-2 border-t">
                  <Button
                    size="sm"
                    className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground h-8"
                    onClick={() => setCurrentView('addIntake')}
                  >
                    Add Intake
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground h-8"
                    onClick={() => setCurrentView('addOutput')}
                  >
                    Add Output
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground h-8"
                    onClick={() => setCurrentView('updateIntake')}
                  >
                    Update Intake
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground h-8"
                    onClick={() => setCurrentView('updateOutput')}
                  >
                    Update Output
                  </Button>
                </div>
              </>
            )}
          </>
        ) : currentView === 'addIntake' ? (
          <IntakeOutputForm title="Add Intake" isIntake={true} isUpdate={false} />
        ) : currentView === 'addOutput' ? (
          <IntakeOutputForm title="Add Output" isIntake={false} isUpdate={false} />
        ) : currentView === 'updateIntake' ? (
          <IntakeOutputList title="Intake List" isIntake={true} />
        ) : currentView === 'updateOutput' ? (
          <IntakeOutputList title="Output List" isIntake={false} />
        ) : null}
      </div>
      <div className="w-1/2 flex flex-col border rounded-md bg-card shadow">
        <div className="flex items-center p-2 border-b bg-card text-foreground rounded-t-md">
          <h2 className="text-base font-semibold">Intake/Output Graph</h2>
        </div>
        <div className="flex-1 p-2">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center text-destructive">
              <p>Error loading chart data</p>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 7 }} 
                  label={{ value: "Time", position: 'insideBottom', offset: -5, fontSize: 7 }} 
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  label={{ value: "Amount (ml)", angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, dy: 0, dx: -5 }}
                />
                <Tooltip 
                  contentStyle={{ fontSize: 10, padding: '5px 10px' }} 
                  formatter={(value, name) => [`${value} ml`, name === 'series1' ? 'Intake' : 'Output']}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  wrapperStyle={{ fontSize: "10px" }} 
                  formatter={(value) => value === 'series1' ? 'Intake' : 'Output'}
                />
                <Line 
                  type="monotone" 
                  dataKey="series1" 
                  name="Intake" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2} 
                  dot={{ r: 3 }} 
                  activeDot={{ r: 5 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="series2" 
                  name="Output" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2} 
                  dot={{ r: 3 }} 
                  activeDot={{ r: 5 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p>No data available for the chart</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProblemsView = () => {
  const [showEntriesValue, setShowEntriesValueState] = useState<string>("10");
  const [searchValue, setSearchValueState] = useState<string>("");
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  
  // Use the patient's SSN or a default one
  const { problems, loading, error } = usePatientProblems('670230065');
  
  const tableHeaders = ["S.No", "Problem", "Type", "Date", "Status", "Actions"];
  
  const filteredProblems = problems.filter((problem: Problem) => {
    const matchesSearch = problem.problem.toLowerCase().includes(searchValue.toLowerCase());
    const matchesStatus = true; // TODO: Add status filter
    return matchesSearch && matchesStatus;
  });
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd MMM, yyyy');
    } catch (e) {
      return dateString; // Return as is if date parsing fails
    }
  };

  if (loading) {
    return (
      <Card className="flex-1 flex flex-col shadow text-xs overflow-hidden">
        <CardHeader className="p-2.5 border-b bg-card text-foreground rounded-t-md">
          <CardTitle className="text-xs">Problems</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex-1 flex flex-col shadow text-xs overflow-hidden">
        <CardHeader className="p-2.5 border-b bg-card text-foreground rounded-t-md">
          <CardTitle className="text-xs">Problems</CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-red-500">
          Error loading problems. Please try again.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1 flex flex-col shadow text-xs overflow-hidden">
      <CardHeader className="p-2.5 border-b bg-card text-foreground rounded-t-md">
        <CardTitle className="text-xs">Problems</CardTitle>
      </CardHeader>
      <CardContent className="p-1 flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between p-2 border-b gap-y-2 mb-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="showEntriesProblem" className="text-xs">Show</Label>
            <Select value={showEntriesValue} onValueChange={setShowEntriesValueState}>
              <SelectTrigger id="showEntriesProblem" className="h-7 w-20 text-xs">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10" className="text-xs">10</SelectItem>
                <SelectItem value="25" className="text-xs">25</SelectItem>
                <SelectItem value="50" className="text-xs">50</SelectItem>
                <SelectItem value="all" className="text-xs">All</SelectItem>
              </SelectContent>
            </Select>
            <Label htmlFor="showEntriesProblem" className="text-xs">entries</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="searchProblem" className="text-xs">Search:</Label>
            <Input 
              id="searchProblem" 
              type="text" 
              value={searchValue} 
              onChange={(e) => setSearchValueState(e.target.value)} 
              className="h-7 w-48 text-xs" 
              placeholder="Search problems..." 
            />
          </div>
        </div>
        <div className="flex-1 overflow-hidden min-h-0">
          <div className="flex-1 overflow-auto max-h-80">
            <Table className="text-xs min-h-0">
              <TableHeader className="bg-accent text-foreground sticky top-0 z-10">
                <TableRow>
                  {tableHeaders.map((header) => (
                    <TableHead key={header} className="py-2 px-3 font-semibold h-8 whitespace-nowrap text-foreground">
                      <div className="flex items-center justify-between">
                        {header}
                        <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground hover:text-foreground cursor-pointer" />
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProblems.length > 0 ? (
                  filteredProblems.map((problem: Problem, index: number) => (
                    <TableRow key={problem.id} className="even:bg-muted/30">
                      <TableCell className="px-2 py-1 text-xs">{index + 1}</TableCell>
                      <TableCell className="px-2 py-1 text-xs">
                        <Button 
                          variant="link" 
                          className="h-auto p-0 text-xs text-left"
                          onClick={() => {
                            setSelectedProblem(problem);
                            setIsViewOpen(true);
                          }}
                        >
                          {problem.problem.split(' (')[0]}
                        </Button>
                      </TableCell>
                      <TableCell className="px-2 py-1 text-xs">{problem.immediacy || 'N/A'}</TableCell>
                      <TableCell className="px-2 py-1 text-xs">{formatDate(problem.dateOfOnset)}</TableCell>
                      <TableCell className="px-2 py-1 text-xs">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          problem.status === 'A' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {problem.status === 'A' ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="px-2 py-1 space-x-1 text-xs">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-xs"
                          onClick={() => window.open(problem.editUrl, '_blank')}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-xs text-red-500 hover:text-red-600"
                          onClick={() => window.open(problem.removeUrl, '_blank')}
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={tableHeaders.length} className="text-center py-10 text-muted-foreground">
                      No problems found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="flex items-center justify-between p-2.5 border-t text-xs text-muted-foreground mt-auto">
          <div>Showing 0 to 0 of 0 entries</div>
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1">Previous</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1 bg-accent text-foreground border-border">1</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1">Next</Button>
          </div>
        </div>
      </CardContent>
      <div className="flex items-center justify-center p-2.5 border-t">
        <Button
          size="sm"
          className="text-xs h-8 bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => setIsPopupOpen(true)}
        >
          New Problem
        </Button>
      </div>

      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-card rounded-lg shadow-lg p-4 w-[32rem] max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h3 className="text-xs">Add New Problem</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsPopupOpen(false)}>
                <Ban className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label className="text-xs w-24">
                  Problem <span className="text-red-500">*</span>
                </Label>
                <Input className="h-8 text-xs flex-1" placeholder="Enter problem" />
              </div>
              <div className="flex items-center gap-4">
                <Label className="text-xs w-24">
                  Type <span className="text-red-500">*</span>
                </Label>
                <Select>
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acute">Acute</SelectItem>
                    <SelectItem value="chronic">Chronic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4">
                <Label className="text-xs w-24">
                  Date <span className="text-red-500">*</span>
                </Label>
                <div className="flex-1">
                  <Input
                    className="h-8 text-xs pr-8"
                    placeholder="MM/DD/YYYY"
                    defaultValue="05/29/2025"
                  />
                  <Button variant="ghost" size="icon" className="h-7 w-7 absolute right-0.5 top-0.5 text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Label className="text-xs w-24">Remark</Label>
                <Input className="h-8 text-xs flex-1" placeholder="Enter remark" />
              </div>
              <div className="flex items-center gap-4">
                <Label className="text-xs w-24">Status</Label>
                <Switch defaultChecked className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input h-5 w-9" />
                <span className="text-xs">ACTIVE</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => setIsPopupOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-xs h-8 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

const FinalDiagnosisView = () => {
  const [showEntriesValue, setShowEntriesValueState] = useState<string>("10");
  const [visitDateValue, setVisitDateValueState] = useState<string>("10 SEP, 2024 13:10");
  const [searchValue, setSearchValueState] = useState<string>("");
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Record<string, string>>({});
  
  // Use the patient's SSN or a default one
  const { diagnosis, loading, error, refresh } = usePatientDiagnosis('670768354');
  
  // Debug logs
  useEffect(() => {
    console.log('Diagnosis data in component:', diagnosis);
    console.log('Loading state:', loading);
    console.log('Error state:', error);
  }, [diagnosis, loading, error]);
  
  const tableHeaders = ["S.No", "Type", "Diagnosis Description", "Comment", "Entered Date", "Provider", "Actions"];
  
  const handleDiagnosisAction = (diagnosisId: string, action: 'add' | 'remove') => {
    setSelectedDiagnosis(prev => ({
      ...prev,
      [diagnosisId]: action
    }));
    
    // In a real app, you would make an API call here to update the diagnosis
    console.log(`${action === 'add' ? 'Adding' : 'Removing'} diagnosis:`, diagnosisId);
  };

  return (
    <Card className="flex-1 flex flex-col shadow text-xs overflow-hidden">
      <CardHeader className="p-2.5 border-b bg-card text-foreground rounded-t-md">
        <CardTitle className="text-base font-semibold">Diagnosis</CardTitle>
      </CardHeader>
      <CardContent className="p-1 flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between p-2 border-b gap-y-2 mb-2">
          <div className="flex items-center space-x-1">
            <Label htmlFor="showEntriesDiagnosis" className="text-xs">Show</Label>
            <Select value={showEntriesValue} onValueChange={setShowEntriesValueState}>
              <SelectTrigger id="showEntriesDiagnosis" className="h-7 w-20 text-xs">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10" className="text-xs">10</SelectItem>
                <SelectItem value="25" className="text-xs">25</SelectItem>
                <SelectItem value="50" className="text-xs">50</SelectItem>
                <SelectItem value="all" className="text-xs">All</SelectItem>
              </SelectContent>
            </Select>
            <Label htmlFor="showEntriesDiagnosis" className="text-xs">entries</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="visitDateDiagnosis" className="text-xs">Visit Date</Label>
            <Select value={visitDateValue} onValueChange={setVisitDateValueState}>
              <SelectTrigger id="visitDateDiagnosis" className="h-7 w-40 text-xs">
                <SelectValue placeholder="Select Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10 SEP, 2024 13:10" className="text-xs">10 SEP, 2024 13:10</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="searchDiagnosis" className="text-xs">Search:</Label>
            <Input 
              id="searchDiagnosis" 
              type="text" 
              value={searchValue} 
              onChange={(e) => setSearchValueState(e.target.value)} 
              className="h-7 w-48 text-xs" 
            />
          </div>
        </div>
        <div className="flex-1 overflow-hidden min-h-0">
          <div className="flex-1 overflow-auto">
            <Table className="text-xs min-h-0">
              <TableHeader className="bg-accent text-foreground sticky top-0 z-10">
                <TableRow>
                  {tableHeaders.map(header => (
                    <TableHead key={header} className="py-2 px-3 font-semibold h-8 whitespace-nowrap text-foreground">
                      <div className="flex items-center justify-between">
                        {header}
                        <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground hover:text-foreground cursor-pointer" />
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={tableHeaders.length} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span>Loading diagnosis data...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={tableHeaders.length} className="text-center py-10 text-red-500">
                      Error loading diagnosis data. <Button variant="link" className="h-auto p-0 text-red-500" onClick={refresh}>Retry</Button>
                    </TableCell>
                  </TableRow>
                ) : Object.keys(diagnosis).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={tableHeaders.length} className="text-center py-10 text-muted-foreground">
                      No diagnosis data found
                    </TableCell>
                  </TableRow>
                ) : (
                  Object.entries(diagnosis).map(([id, diag]: [string, any]) => (
                    <TableRow key={id} className="even:bg-muted/30">
                      <TableCell>{id}</TableCell>
                      <TableCell className="capitalize">{diag.Type || 'N/A'}</TableCell>
                      <TableCell>{diag["Diagnosis Description"] || 'N/A'}</TableCell>
                      <TableCell>{diag.Comment || 'N/A'}</TableCell>
                      <TableCell>{diag["Entered Date"] || 'N/A'}</TableCell>
                      <TableCell>{diag.Provider || 'N/A'}</TableCell>
                      <TableCell className="space-x-1">
                        {selectedDiagnosis[id] === 'add' ? (
                          <Button variant="outline" size="sm" className="h-7 text-xs" disabled>
                            Added
                          </Button>
                        ) : selectedDiagnosis[id] === 'remove' ? (
                          <Button variant="outline" size="sm" className="h-7 text-xs" disabled>
                            Removed
                          </Button>
                        ) : (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-xs"
                              onClick={() => handleDiagnosisAction(id, 'add')}
                            >
                              Add
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-xs text-red-500 hover:text-red-600"
                              onClick={() => handleDiagnosisAction(id, 'remove')}
                            >
                              Remove
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="flex items-center justify-between p-2.5 border-t text-xs text-muted-foreground mt-auto">
          <div>Showing {Object.keys(diagnosis).length > 0 ? 1 : 0} to {Object.keys(diagnosis).length} of {Object.keys(diagnosis).length} entries</div>
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1">Previous</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1 bg-accent text-foreground border-border">1</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1">Next</Button>
          </div>
        </div>
      </CardContent>
      <div className="flex items-center justify-center p-2.5 border-t">
        <Button size="sm" className="text-xs h-8 bg-primary hover:bg-primary/90 text-primary-foreground">New Diagnosis</Button>
      </div>
    </Card>
  );
};

const ChiefComplaintsView = () => {
  const [showEntriesValue, setShowEntriesValueState] = useState<string>("10");
  const [searchValue, setSearchValueState] = useState<string>("");
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const { complaints, loading, error, refresh } = usePatientComplaints('670768354');
  
  const tableHeaders = ["S.No", "Complaint", "Type", "Date/Time", "Status", "Remarks"];

  // Debug logs
  useEffect(() => {
    console.log('Complaints data:', complaints);
  }, [complaints]);

  return (
    <Card className="flex-1 flex flex-col shadow text-xs overflow-hidden">
      <CardHeader className="p-2.5 border-b bg-card text-foreground rounded-t-md">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Chief Complaints</CardTitle>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-primary hover:bg-muted/50"
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-primary hover:bg-muted/50"
              onClick={() => setIsPopupOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-1 flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between p-2 border-b gap-y-2 mb-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="showEntries" className="text-xs">Show</Label>
            <Select value={showEntriesValue} onValueChange={setShowEntriesValueState}>
              <SelectTrigger id="showEntries" className="h-7 w-20 text-xs">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10" className="text-xs">10</SelectItem>
                <SelectItem value="25" className="text-xs">25</SelectItem>
                <SelectItem value="50" className="text-xs">50</SelectItem>
                <SelectItem value="all" className="text-xs">All</SelectItem>
              </SelectContent>
            </Select>
            <Label htmlFor="showEntries" className="text-xs">entries</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="search" className="text-xs">Search:</Label>
            <Input 
              id="search" 
              type="text" 
              value={searchValue} 
              onChange={(e) => setSearchValueState(e.target.value)} 
              className="h-7 w-48 text-xs" 
              placeholder="Search complaints..." 
            />
          </div>
        </div>
        <div className="flex-1 overflow-hidden min-h-0">
          <div className="flex-1 overflow-auto">
            <Table className="text-xs min-h-0">
              <TableHeader className="bg-accent text-foreground sticky top-0 z-10">
                <TableRow>
                  {tableHeaders.map(header => (
                    <TableHead key={header} className="py-2 px-3 font-semibold h-8 whitespace-nowrap text-foreground">
                  <div className="flex items-center justify-between">
                    {header}
                    <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground hover:text-foreground cursor-pointer" />
                  </div>
                  </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={tableHeaders.length} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span>Loading complaints data...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={tableHeaders.length} className="text-center py-10 text-red-500">
                      Error loading complaints. <Button variant="link" className="h-auto p-0 text-red-500" onClick={refresh}>Retry</Button>
                    </TableCell>
                  </TableRow>
                ) : Object.keys(complaints).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={tableHeaders.length} className="text-center py-10 text-muted-foreground">
                      No complaints found
                    </TableCell>
                  </TableRow>
                ) : (
                  Object.entries(complaints).map(([id, complaint]) => (
                    <TableRow key={id} className="even:bg-muted/30">
                      <TableCell>{id}</TableCell>
                      <TableCell className="font-medium">{complaint.CompName}</TableCell>
                      <TableCell>{complaint.CmpType}</TableCell>
                      <TableCell>{complaint.DateTime}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          complaint.Status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {complaint.Status}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={complaint.Remark}>
                        {complaint.Remark || '-'}
                      </TableCell>
                      
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="flex items-center justify-between p-2.5 border-t text-xs text-muted-foreground mt-auto">
          <div>Showing {Object.keys(complaints).length > 0 ? 1 : 0} to {Object.keys(complaints).length} of {Object.keys(complaints).length} entries</div>
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1">Previous</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1 bg-accent text-foreground border-border">1</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1">Next</Button>
          </div>
        </div>
      </CardContent>

      {/* Add Complaint Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-[500px] p-5 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setIsPopupOpen(false)}
            >
              ✖
            </button>
            <h2 className="text-base font-semibold mb-4">Add Chief Complaint</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Complaint</label>
                <input
                  type="text"
                  placeholder="E.g. Headache"
                  className="mt-1 block w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="complaintType">Type</label>
                <select id="complaintType" className="mt-1 block w-full px-3 py-2 border rounded text-sm">
                  <option>New</option>
                  <option>Follow-up</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Remark</label>
                <textarea
                  placeholder="Optional remarks"
                  className="mt-1 block w-full px-3 py-2 border rounded text-sm"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsPopupOpen(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
};

const AllergiesView = () => {
  const [showEntriesValue, setShowEntriesValueState] = useState<string>("10");
  const [searchValue, setSearchValueState] = useState<string>("");
  const [selectedAllergies, setSelectedAllergies] = useState<Record<string, boolean>>({});
  const { allergies, loading, error, refresh } = usePatientAllergies('670768354');

  // Debug logs
  useEffect(() => {
    console.log('Allergies data in component:', allergies);
  }, [allergies]);

  const tableHeaders = ["S.No", "Allergies", "Date", "Nature of Reaction", "Observed/Historical", "Originator", "Symptoms", "Actions"];

  const handleAllergyAction = (allergyId: string, action: 'add' | 'remove') => {
    setSelectedAllergies(prev => ({
      ...prev,
      [allergyId]: action === 'add'
    }));
    // In a real app, you would make an API call here to update the allergy status
    console.log(`${action === 'add' ? 'Adding' : 'Removing'} allergy:`, allergyId);
  };

  return (
    <Card className="flex-1 flex flex-col shadow text-xs overflow-hidden">
      <CardHeader className="p-2.5 border-b bg-card text-foreground rounded-t-md">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Allergies</CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-primary hover:bg-muted/50"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-1 flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between p-2 border-b gap-y-2 mb-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="showEntriesAllergy" className="text-xs">Show</Label>
            <Select value={showEntriesValue} onValueChange={setShowEntriesValueState}>
              <SelectTrigger id="showEntriesAllergy" className="h-7 w-20 text-xs">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10" className="text-xs">10</SelectItem>
                <SelectItem value="25" className="text-xs">25</SelectItem>
                <SelectItem value="50" className="text-xs">50</SelectItem>
                <SelectItem value="all" className="text-xs">All</SelectItem>
              </SelectContent>
            </Select>
            <Label htmlFor="showEntriesAllergy" className="text-xs">entries</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="searchAllergy" className="text-xs">Search:</Label>
            <Input 
              id="searchAllergy" 
              type="text" 
              value={searchValue} 
              onChange={(e) => setSearchValueState(e.target.value)} 
              className="h-7 w-48 text-xs" 
              placeholder="Search allergies..." 
            />
          </div>
        </div>
        <div className="flex-1 overflow-hidden min-h-0">
          <div className="flex-1 overflow-auto">
            <Table className="text-xs min-h-0">
              <TableHeader className="bg-accent text-foreground sticky top-0 z-10">
                <TableRow>
                  {tableHeaders.map(header => (
                    <TableHead 
                      key={header} 
                      className={`py-2 px-3 font-semibold h-8 whitespace-nowrap text-foreground ${
                        header === 'Actions' ? 'text-center' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {header}
                        {header !== 'Actions' && (
                          <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground hover:text-foreground cursor-pointer" />
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </ TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={tableHeaders.length} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span>Loading allergies data...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={tableHeaders.length} className="text-center py-10 text-red-500">
                      Error loading allergies data. <Button variant="link" className="h-auto p-0 text-red-500" onClick={refresh}>Retry</Button>
                    </TableCell>
                  </TableRow>
                ) : Object.keys(allergies).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={tableHeaders.length} className="text-center py-10 text-muted-foreground">
                      No allergies found
                    </TableCell>
                  </TableRow>
                ) : (
                  Object.entries(allergies).map(([id, allergy], index) => (
                    <TableRow key={id} className="even:bg-muted/30">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{allergy.Allergies}</TableCell>
                      <TableCell>{allergy.Date}</TableCell>
                      <TableCell>
                        {allergy["Nature of Reaction"] && (
                          <span className="capitalize">{allergy["Nature of Reaction"]}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {allergy["Observed/Historical"] && (
                          <span className="capitalize">{allergy["Observed/Historical"]}</span>
                        )}
                      </TableCell>
                      <TableCell>{allergy.Originator}</TableCell>
                      <TableCell>{allergy.Symptoms}</TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={`h-7 text-xs ${
                            selectedAllergies[id] 
                              ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                          onClick={() => handleAllergyAction(id, selectedAllergies[id] ? 'remove' : 'add')}
                        >
                          {selectedAllergies[id] ? 'Remove' : 'Add'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="flex items-center justify-between p-2.5 border-t text-xs text-muted-foreground mt-auto">
          <div>Showing {Object.keys(allergies).length > 0 ? 1 : 0} to {Object.keys(allergies).length} of {Object.keys(allergies).length} entries</div>
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1">Previous</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1 bg-accent text-foreground border-border">1</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1">Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const OpdIpdDetailsView = () => {
  const [showEntriesValue, setShowEntriesValueState] = useState<string>("10");
  const [visitDateValue, setVisitDateValueState] = useState<string>("10 SEP, 2024 13:10");
  const [statusSwitchChecked, setStatusSwitchCheckedState] = useState<boolean>(true);
  const [searchValue, setSearchValueState] = useState<string>("");

  const tableHeaders = ["S.No", "Visit ID", "Visit Type", "Department", "Doctor", "Date", "Status"];

  return (
    <Card className="flex-1 flex flex-col shadow text-xs overflow-hidden">
      <CardHeader className="p-2.5 border-b bg-card text-foreground rounded-t-md">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">OPD/IPD Details</CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-muted/50">
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-1 flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between p-2 border-b gap-y-2 mb-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="showEntriesOpdIpd" className="text-xs">Show</Label>
            <Select value={showEntriesValue} onValueChange={setShowEntriesValueState}>
              <SelectTrigger id="showEntriesOpdIpd" className="h-7 w-20 text-xs">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10" className="text-xs">10</SelectItem>
                <SelectItem value="25" className="text-xs">25</SelectItem>
                <SelectItem value="50" className="text-xs">50</SelectItem>
                <SelectItem value="all" className="text-xs">All</SelectItem>
              </SelectContent>
            </Select>
            <Label htmlFor="showEntriesOpdIpd" className="text-xs">entries</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="visitDateOpdIpd" className="text-xs">Visit Date</Label>
            <Select value={visitDateValue} onValueChange={setVisitDateValueState}>
              <SelectTrigger id="visitDateOpdIpd" className="h-7 w-40 text-xs">
                <SelectValue placeholder="Select Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10 SEP, 2024 13:10" className="text-xs">10 SEP, 2024 13:10</SelectItem>
              </SelectContent>
            </Select>
            <Label htmlFor="statusSwitchOpdIpd" className="text-xs">Status</Label>
            <Switch id="statusSwitchOpdIpd" checked={statusSwitchChecked} onCheckedChange={setStatusSwitchCheckedState} className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input h-5 w-9" />
            <Label htmlFor="statusSwitchOpdIpd" className="text-xs ml-1">{statusSwitchChecked ? "ACTIVE" : "INACTIVE"}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="searchOpdIpd" className="text-xs">Search:</Label>
            <Input id="searchOpdIpd" type="text" value={searchValue} onChange={(e) => setSearchValueState(e.target.value)} className="h-7 w-48 text-xs" />
          </div>
        </div>
        <div className="flex-1 overflow-hidden min-h-0">
          <div className="flex-1 overflow-auto">
            <Table className="text-xs min-h-0">
              <TableHeader className="bg-accent text-foreground sticky top-0 z-10">
                <TableRow>
                  {tableHeaders.map(header => (
                    <TableHead key={header} className="py-2 px-3 font-semibold h-8 whitespace-nowrap text-foreground">
                      <div className="flex items-center justify-between">
                        {header}
                        <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground hover:text-foreground cursor-pointer" />
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="even:bg-muted/30">
                  <TableCell colSpan={tableHeaders.length} className="text-center py-10 text-muted-foreground">
                    No Data Found
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="flex items-center justify-between p-2.5 border-t text-xs text-muted-foreground mt-auto">
          <div>Showing 0 to 0 of 0 entries</div>
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1">Previous</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1 bg-accent text-foreground border-border">1</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1">Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const VitalsDashboardPage: NextPage<{ patient?: Patient }> = ({ patient }) => {
  const [activeVerticalTab, setActiveVerticalTab] = useState<string>(verticalNavItems[0]);

  return (
    <div className="flex flex-col h-[calc(100vh-var(--top-nav-height,60px))] bg-background text-sm px-3 pb-3 pt-0">
      <div className="flex items-end space-x-1 px-1 pb-0 pt-1 overflow-x-auto no-scrollbar">
        {verticalNavItems.map((item) => (
          <Button
            key={item}
            onClick={() => setActiveVerticalTab(item)}
            className={`text-xs px-3 py-1.5 h-auto rounded-b-none rounded-t-md whitespace-nowrap focus-visible:ring-0 focus-visible:ring-offset-0
              ${activeVerticalTab === item
                ? 'bg-background text-primary border-x border-t border-border border-b-2 border-b-background shadow-sm relative -mb-px z-10 hover:bg-background hover:text-primary'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground border-x border-t border-transparent hover:text-foreground'
              }`}
          >
            {item}
          </Button>
        ))}
      </div>
      <main className="flex-1 flex flex-col gap-3 overflow-hidden">
        {activeVerticalTab === "Vitals" && <VitalsView />}
        {activeVerticalTab === "Intake/Output" && <IntakeOutputView />}
        {activeVerticalTab === "Problems" && <ProblemsView />}
        {activeVerticalTab === "Final Diagnosis" && <FinalDiagnosisView />}
        {activeVerticalTab === "Chief-Complaints" && <ChiefComplaintsView />}
        {activeVerticalTab === "Allergies" && <AllergiesView />}
        {activeVerticalTab === "OPD/IPD Details" && <OpdIpdDetailsView />}
        {![
          "Vitals", "Intake/Output", "Problems", "Final Diagnosis",
          "Chief-Complaints", "Allergies", "OPD/IPD Details"
        ].includes(activeVerticalTab) && (
            <Card className="flex-1 flex items-center justify-center">
              <CardContent className="text-center">
                <CardTitle className="text-xl text-muted-foreground">
                  {activeVerticalTab} View
                </CardTitle>
                <p className="text-sm text-muted-foreground">Content for this section is not yet implemented.</p>
              </CardContent>
            </Card>
          )}
      </main>
    </div>
  );
};

export default VitalsDashboardPage;