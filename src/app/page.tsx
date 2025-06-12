'use client';

import { Card, CardContent, CardTitle, CardHeader as ShadcnCardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { CartesianGrid, XAxis, YAxis, Line, LineChart as RechartsLineChart } from 'recharts';
import {
  Droplet, HeartPulse, Activity, Thermometer, Scale, Edit3, Clock, Pill as PillIcon, X, Ban, FileText,
  ScanLine, ClipboardList, BellRing,
} from 'lucide-react';
import {
  HealthMetric, Problem, Medication, ProblemCategory, ProblemStatus, ProblemImmediacy, ProblemService,
  MOCK_PROBLEMS, MOCK_MEDICATIONS, pageCardSampleContent, MOCK_KEY_INDICATORS,
  MOCK_HEART_RATE_MONITOR_DATA, MOCK_HEART_RATE_MONITOR_CHART_CONFIG,
  MOCK_GLUCOSE_DATA, MOCK_BLOOD_PRESSURE_DATA, MOCK_BODY_TEMPERATURE_DATA, MOCK_WEIGHT_DATA,
  MOCK_PATIENT, Patient,
} from '@/lib/constants';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import usePatientProblems from '@/hooks/usePatientProblems';

// Chart configurations
const glucoseChartConfig: ChartConfig = { level: { label: 'Glucose (mg/dL)', color: 'hsl(var(--chart-2))' } };
const bloodPressureChartConfig: ChartConfig = {
  systolic: { label: 'Systolic (mmHg)', color: 'hsl(var(--chart-1))' },
  diastolic: { label: 'Diastolic (mmHg)', color: 'hsl(var(--chart-3))' },
};
const bodyTemperatureChartConfig: ChartConfig = { temp: { label: 'Temperature (°F)', color: 'hsl(var(--chart-4))' } };
const weightChartConfig: ChartConfig = { weight: { label: 'Weight (kg)', color: 'hsl(var(--chart-5))' } };

// Icon mappings for informational cards
const infoCardIcons: Record<string, React.ElementType> = {
  Allergies: Ban,
  Radiology: ScanLine,
  'Lab Report': FileText,
  'Clinical notes': FileText,
  'Encounter notes': ClipboardList,
  'Clinical reminder': BellRing,
};

// Card titles for dashboard rows
const secondRowInformationalCardTitles: string[] = ['Allergies', 'Medications History', 'Lab Report', 'Radiology'];
const thirdRowInformationalCardTitles: string[] = ['Clinical notes', 'Encounter notes', 'Clinical reminder'];

// Define Allergy interface
interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  dateOnset: string;
  treatment: string;
  status: 'Active' | 'Inactive';
  notes: string;
  createdBy: string;
  createdAt: string;
}

// Define Dialog types
type DialogType = 'problem' | 'medication' | 'info-item' | 'allergies' | 'radiology' | 'report';

interface FloatingDialog {
  id: string;
  type: DialogType;
  title: string;
  position: { x: number; y: number };
  data?: any;
}

// Medication row interface for table
interface MedicationRow {
  medicationName: string;
  dosage: string;
  route: string;
  schedule: string;
  prn: boolean;
  duration: string;
  durationUnit: string;
  priority: string;
  additionalDoseNow: boolean;
  comment: string;
}

export default function DashboardPage({
  patient,
  problems,
  medications,
  allergies,
  vitals,
}: {
  patient: Patient;
  problems: Problem[];
  medications: Medication[];
  allergies: Allergy[];
  vitals: any; // Replace with your vitals type if available
}): JSX.Element {
  // Fetch up-to-date problems for the patient (fallback to provided problems until fetch completes)
  const effectiveSSN = patient.ssn && patient.ssn.trim() !== '' ? patient.ssn : '670230065';
  const { problems: fetchedProblems } = usePatientProblems(effectiveSSN);
  const problemsToShow = fetchedProblems.length ? fetchedProblems : problems;

  // State management
  const [dynamicPageCardContent, setDynamicPageCardContent] = useState<Record<string, string[]>>(() => {
    const parsedContent = JSON.parse(JSON.stringify(pageCardSampleContent)) as Record<string, string[]>;
    return Object.fromEntries(Object.entries(parsedContent).filter(([key]) => key !== 'Allergies'));
  });
  const [floatingDialogs, setFloatingDialogs] = useState<FloatingDialog[]>([]);
  const [activeChartTab, setActiveChartTab] = useState<string>('heart-rate');
  const [detailViewTitle, setDetailViewTitle] = useState<string>('');
  const [detailViewContent, setDetailViewContent] = useState<string>('');
  const [medSearch, setMedSearch] = useState<string>('');
  const [quickOrder, setQuickOrder] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [filteredMeds, setFilteredMeds] = useState<string[]>([]);
  const [localMedications, setLocalMedications] = useState<Medication[]>(medications || []);
  const [selectedRows, setSelectedRows] = useState<MedicationRow[]>([]);
  const [showProblemDialog, setShowProblemDialog] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [showAllergyDialog, setShowAllergyDialog] = useState(false);
  const [selectedAllergy, setSelectedAllergy] = useState<Allergy | null>(null);

  // Dialog input states
  const [problemInputs, setProblemInputs] = useState<
    Record<string, { input: string; category: ProblemCategory | ''; other: boolean; preferred: string[]; status: ProblemStatus | ''; immediacy: ProblemImmediacy | ''; dateOnset: string; service: ProblemService | ''; comment: string }>
  >({});
  const [medicationInputs, setMedicationInputs] = useState<
    Record<string, { name: string; reason: string; amount: string; timing: string }>
  >({});
  const [infoItemInputs, setInfoItemInputs] = useState<
    Record<string, { title: string; item: string }>
  >({});
  const [allergyInputs, setAllergyInputs] = useState<
    Record<string, { allergen: string; reaction: string; severity: 'Mild' | 'Moderate' | 'Severe' | ''; dateOnset: string; treatment: string; status: 'Active' | 'Inactive' | ''; notes: string }>
  >({});
  const [radiologyInputs, setRadiologyInputs] = useState<
    Record<string, { type: string; bodyPart: string; notes: string }>
  >({});
  const [reportInputs, setReportInputs] = useState<
    Record<string, { search: string; quickSearch: string; selected: string[] }>
  >({});

  // Dialog refs for dragging
  const dialogRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dialogDragging = useRef<Record<string, boolean>>({});
  const dragStartCoords = useRef<Record<string, { x: number; y: number }>>({});
  const initialDialogOffset = useRef<Record<string, { x: number; y: number }>>({});

  // Medication constants
  const ROUTES = ['Oral', 'IV', 'IM', 'Subcutaneous'];
  const SCHEDULES = ['Daily', 'BID', 'TID', 'QID'];
  const PRIORITIES = ['Routine', 'Urgent', 'STAT'];
  const MEDICATIONS = ['Aspirin', 'Metformin', 'Ibuprofen', 'Lisinopril'];

  // Auto-save functionality for dialog inputs
  useEffect(() => {
    const saveDrafts = () => {
      if (Object.keys(allergyInputs).length > 0) {
        localStorage.setItem('allergyInputsDraft', JSON.stringify(allergyInputs));
      }
      if (Object.keys(problemInputs).length > 0) {
        localStorage.setItem('problemInputsDraft', JSON.stringify(problemInputs));
      }
      if (Object.keys(medicationInputs).length > 0) {
        localStorage.setItem('medicationInputsDraft', JSON.stringify(medicationInputs));
      }
      if (Object.keys(infoItemInputs).length > 0) {
        localStorage.setItem('infoItemInputsDraft', JSON.stringify(infoItemInputs));
      }
      if (Object.keys(radiologyInputs).length > 0) {
        localStorage.setItem('radiologyInputsDraft', JSON.stringify(radiologyInputs));
      }
      if (Object.keys(reportInputs).length > 0) {
        localStorage.setItem('reportInputsDraft', JSON.stringify(reportInputs));
      }
    };

    const interval = setInterval(saveDrafts, 30 * 1000); // Save every 30 seconds
    return () => clearInterval(interval);
  }, [allergyInputs, problemInputs, medicationInputs, infoItemInputs, radiologyInputs, reportInputs]);

  // Load drafts on component mount
  useEffect(() => {
    const loadDrafts = () => {
      const allergyDraft = localStorage.getItem('allergyInputsDraft');
      if (allergyDraft) setAllergyInputs(JSON.parse(allergyDraft));

      const problemDraft = localStorage.getItem('problemInputsDraft');
      if (problemDraft) setProblemInputs(JSON.parse(problemDraft));

      const medicationDraft = localStorage.getItem('medicationInputsDraft');
      if (medicationDraft) setMedicationInputs(JSON.parse(medicationDraft));

      const infoItemDraft = localStorage.getItem('infoItemInputsDraft');
      if (infoItemDraft) setInfoItemInputs(JSON.parse(infoItemDraft));

      const radiologyDraft = localStorage.getItem('radiologyInputsDraft');
      if (radiologyDraft) setRadiologyInputs(JSON.parse(radiologyDraft));

      const reportDraft = localStorage.getItem('reportInputsDraft');
      if (reportDraft) setReportInputs(JSON.parse(reportDraft));
    };

    loadDrafts();
  }, []);

  // Dialog management
  const openFloatingDialog = useCallback((type: DialogType, title: string, data?: any) => {
    if (floatingDialogs.length >= 3) {
      toast.error('Maximum 3 dialogs can be open at a time.');
      return;
    }

    const id = Date.now().toString();
    setFloatingDialogs((prev) => [
      ...prev,
      {
        id,
        type,
        title,
        position: { x: 0, y: 0 },
        data,
      },
    ]);

    if (type === 'problem') {
      setProblemInputs((prev) => ({
        ...prev,
        [id]: {
          input: '',
          category: '',
          other: false,
          preferred: [],
          status: '',
          immediacy: '',
          dateOnset: '',
          service: '',
          comment: '',
        },
      }));
    } else if (type === 'medication') {
      setMedicationInputs((prev) => ({
        ...prev,
        [id]: { name: '', reason: '', amount: '', timing: '' },
      }));
    } else if (type === 'info-item') {
      setInfoItemInputs((prev) => ({
        ...prev,
        [id]: { title: data?.title || '', item: '' },
      }));
    } else if (type === 'allergies') {
      setAllergyInputs((prev) => ({
        ...prev,
        [id]: { allergen: '', reaction: '', severity: '', dateOnset: '', treatment: '', status: '', notes: '' },
      }));
    } else if (type === 'radiology') {
      setRadiologyInputs((prev) => ({
        ...prev,
        [id]: { type: '', bodyPart: '', notes: '' },
      }));
    } else if (type === 'report') {
      setReportInputs((prev) => ({
        ...prev,
        [id]: { search: '', quickSearch: '', selected: [] },
      }));
    }
  }, [floatingDialogs]);

  const closeFloatingDialog = useCallback((id: string) => {
    setFloatingDialogs((prev) => prev.filter((dialog) => dialog.id !== id));
    setProblemInputs((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    setMedicationInputs((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    setInfoItemInputs((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    setAllergyInputs((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    setRadiologyInputs((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    setReportInputs((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  // Dialog dragging functionality
  const handleMouseDown = useCallback((id: string, e: React.MouseEvent<HTMLDivElement>) => {
    const dialogRef = dialogRefs.current[id];
    if (dialogRef) {
      dialogDragging.current[id] = true;
      dragStartCoords.current[id] = { x: e.clientX, y: e.clientY };
      const style = window.getComputedStyle(dialogRef);
      const matrix = new DOMMatrixReadOnly(style.transform);
      initialDialogOffset.current[id] = { x: matrix.m41, y: matrix.m42 };
      dialogRef.style.cursor = 'grabbing';
      document.body.style.cursor = 'grabbing';
      e.preventDefault();
    }
  }, []);

  const handleKeyDown = useCallback((id: string, e: React.KeyboardEvent<HTMLDivElement>) => {
    const dialogRef = dialogRefs.current[id];
    if (!dialogRef) return;

    const step = 10; // Pixels to move per key press
    const style = window.getComputedStyle(dialogRef);
    const matrix = new DOMMatrixReadOnly(style.transform);
    let x = matrix.m41;
    let y = matrix.m42;

    if (e.key === 'ArrowUp') {
      y -= step;
    } else if (e.key === 'ArrowDown') {
      y += step;
    } else if (e.key === 'ArrowLeft') {
      x -= step;
    } else if (e.key === 'ArrowRight') {
      x += step;
    } else if (e.key === 'Escape') {
      closeFloatingDialog(id);
      return;
    } else {
      return;
    }

    dialogRef.style.transform = `translate(${x}px, ${y}px)`;
  }, [closeFloatingDialog]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      Object.keys(dialogDragging.current).forEach((id) => {
        if (dialogDragging.current[id] && dialogRefs.current[id]) {
          const deltaX = e.clientX - dragStartCoords.current[id].x;
          const deltaY = e.clientY - dragStartCoords.current[id].y;
          const newX = initialDialogOffset.current[id].x + deltaX;
          const newY = initialDialogOffset.current[id].y + deltaY;
          dialogRefs.current[id]!.style.transform = `translate(${newX}px, ${newY}px)`;
        }
      });
    };

    const handleMouseUp = () => {
      Object.keys(dialogDragging.current).forEach((id) => {
        if (dialogDragging.current[id] && dialogRefs.current[id]) {
          dialogDragging.current[id] = false;
          dialogRefs.current[id]!.style.cursor = 'grab';
          document.body.style.cursor = 'default';
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Handle medication search and table
  const handleSelectMed = (med: string) => {
    setSelectedRows((prev) => [
      ...prev,
      {
        medicationName: med,
        dosage: '',
        route: 'Oral',
        schedule: 'Daily',
        prn: false,
        duration: '1',
        durationUnit: 'days',
        priority: 'Routine',
        additionalDoseNow: false,
        comment: '',
      },
    ]);
    setMedSearch('');
    setDropdownOpen(false);
  };

  const handleRowChange = (
    idx: number,
    field: keyof MedicationRow,
    value: string | boolean
  ) => {
    setSelectedRows((prev) =>
      prev.map((row, i) =>
        i === idx ? { ...row, [field]: value } : row
      )
    );
  };

  const handleRemoveRow = (idx: number) => {
    setSelectedRows((prev) => prev.filter((_, i) => i !== idx));
  };

  // Handle adding new entries
  const handleAddProblem = (dialogId: string) => {
    const input = problemInputs[dialogId];
    if (!input?.input.trim()) {
      toast.error('Problem description is required.');
      return;
    }
    if (!input.status) {
      toast.error('Status is required.');
      return;
    }
    if (!input.immediacy) {
      toast.error('Immediacy is required.');
      return;
    }

    const newProb: Problem = {
      id: Date.now().toString(),
      description: input.input,
    };
    toast.success('Problem added successfully!');
    closeFloatingDialog(dialogId);
  };

  const handleAddMedication = (dialogId: string) => {
    const input = medicationInputs[dialogId];
    if (!input?.name.trim()) {
      toast.error('Medication name is required.');
      return;
    }

    const newMed: Medication = {
      id: Date.now().toString(),
      name: input.name,
      reason: input.reason || 'General',
      amount: input.amount || 'N/A',
      timing: input.timing || 'N/A',
      status: 'Active',
    };
    toast.success('Medication added successfully!');
    closeFloatingDialog(dialogId);
  };

  const handleAddAllergy = (dialogId: string) => {
    const input = allergyInputs[dialogId];
    if (!input?.allergen.trim() || !input.severity || !input.status) {
      toast.error('Please fill all required fields: Allergen, Severity, and Status.');
      return;
    }

    const newAllergy: Allergy = {
      id: Date.now().toString(),
      allergen: input.allergen,
      reaction: input.reaction || 'Not specified',
      severity: input.severity as 'Mild' | 'Moderate' | 'Severe',
      dateOnset: input.dateOnset || '',
      treatment: input.treatment || '',
      status: input.status as 'Active' | 'Inactive',
      notes: input.notes || '',
      createdBy: 'Dr. User',
      createdAt: new Date().toISOString(),
    };
    toast.success('Allergy added successfully!');
    closeFloatingDialog(dialogId);
  };

  const handleSaveNewInfoItem = (dialogId: string) => {
    const input = infoItemInputs[dialogId];
    if (!input?.item.trim() || !input.title) {
      toast.error('Item content and title are required.');
      return;
    }

    setDynamicPageCardContent((prev) => ({
      ...prev,
      [input.title]: [input.item, ...(prev[input.title] || [])],
    }));
    toast.success('Item added successfully!');
    closeFloatingDialog(dialogId);
  };

  return (
    <div className="flex flex-1 flex-col p-3 bg-background relative">
      {/* Top Row: Problems, Chart, Vital Signs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-2">
        <Card className="lg:col-span-3 shadow-lg">
          <ShadcnCardHeader className="flex flex-row items-center justify-between pt-2 pb-0 px-3">
            <div className="flex items-center space-x-1.5">
              <Clock className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Problems</CardTitle>
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{problemsToShow.length}</Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => openFloatingDialog('problem', 'Add New Problem')}
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span className="sr-only">Add Problem</span>
            </Button>
          </ShadcnCardHeader>
          <CardContent className="p-0 max-h-32 overflow-y-auto no-scrollbar">
            <Table>
              <TableBody>
                {problemsToShow.map((problem, index) => (
                  <TableRow key={problem.id} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                    <TableCell className="px-2 py-1">
                      <div
                        className="font-medium text-xs cursor-pointer"
                        onClick={() => {
                          setSelectedProblem(problem);
                          setShowProblemDialog(true);
                        }}
                      >{('description' in problem ? (problem as any).description : (problem as any).problem)}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {problemsToShow.length === 0 && (
              <p className="py-4 text-center text-xs text-muted-foreground">No problems listed.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-5 shadow-lg h-full">
          <CardContent className="pt-2 px-2 pb-2">
            <Tabs value={activeChartTab} onValueChange={setActiveChartTab} className="w-full">
              <TabsList className="hidden">
                <TabsTrigger value="heart-rate">Heart Rate</TabsTrigger>
                <TabsTrigger value="blood-glucose">Blood Glucose</TabsTrigger>
                <TabsTrigger value="blood-pressure">Blood Pressure</TabsTrigger>
                <TabsTrigger value="body-temperature">Body Temperature</TabsTrigger>
                <TabsTrigger value="weight">Weight</TabsTrigger>
                <TabsTrigger value="detail-view">Detail</TabsTrigger>
              </TabsList>
              <TabsContent value="heart-rate">
                <ChartContainer config={MOCK_HEART_RATE_MONITOR_CHART_CONFIG} className="h-[140px] w-full">
                  <RechartsLineChart data={MOCK_HEART_RATE_MONITOR_DATA} margin={{ left: 0, right: 5, top: 5, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={4} fontSize={9} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={4} fontSize={9} domain={[60, 120]} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Line
                      dataKey="hr"
                      type="monotone"
                      stroke="var(--color-hr)"
                      strokeWidth={1.5}
                      dot={(props: any) => {
                        const { cx, cy, value } = props;
                        const isCritical = value < 60 || value > 100;
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isCritical ? 4 : 2}
                            fill={isCritical ? 'red' : 'var(--color-hr)'}
                            stroke="none"
                          />
                        );
                      }}
                    />
                  </RechartsLineChart>
                </ChartContainer>
              </TabsContent>
              <TabsContent value="blood-glucose">
                <ChartContainer config={glucoseChartConfig} className="h-[140px] w-full">
                  <RechartsLineChart data={MOCK_GLUCOSE_DATA} margin={{ left: 0, right: 5, top: 5, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={4} fontSize={9} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={4} fontSize={9} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Line
                      dataKey="level"
                      type="monotone"
                      stroke="var(--color-level)"
                      strokeWidth={1.5}
                      dot={(props: any) => {
                        const { cx, cy, value } = props;
                        const isCritical = value < 70 || value > 180;
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isCritical ? 4 : 2}
                            fill={isCritical ? 'red' : 'var(--color-level)'}
                            stroke="none"
                          />
                        );
                      }}
                    />
                  </RechartsLineChart>
                </ChartContainer>
              </TabsContent>
              <TabsContent value="blood-pressure">
                <ChartContainer config={bloodPressureChartConfig} className="h-[140px] w-full">
                  <RechartsLineChart data={MOCK_BLOOD_PRESSURE_DATA} margin={{ left: 0, right: 5, top: 5, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={4} fontSize={9} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={4} fontSize={9} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                    <Line
                      dataKey="systolic"
                      type="monotone"
                      stroke="var(--color-systolic)"
                      strokeWidth={1.5}
                      dot={(props: any) => {
                        const { cx, cy, value } = props;
                        const isCritical = value < 90 || value > 140;
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isCritical ? 4 : 2}
                            fill={isCritical ? 'red' : 'var(--color-systolic)'}
                            stroke="none"
                          />
                        );
                      }}
                    />
                    <Line
                      dataKey="diastolic"
                      type="monotone"
                      stroke="var(--color-diastolic)"
                      strokeWidth={1.5}
                      dot={(props: any) => {
                        const { cx, cy, value } = props;
                        const isCritical = value < 60 || value > 90;
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isCritical ? 4 : 2}
                            fill={isCritical ? 'red' : 'var(--color-diastolic)'}
                            stroke="none"
                          />
                        );
                      }}
                    />
                  </RechartsLineChart>
                </ChartContainer>
              </TabsContent>
              <TabsContent value="body-temperature">
                <ChartContainer config={bodyTemperatureChartConfig} className="h-[140px] w-full">
                  <RechartsLineChart data={MOCK_BODY_TEMPERATURE_DATA} margin={{ left: 0, right: 5, top: 5, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={4} fontSize={9} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={4} fontSize={9} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Line
                      dataKey="temp"
                      type="monotone"
                      stroke="var(--color-temp)"
                      strokeWidth={1.5}
                      dot={(props: any) => {
                        const { cx, cy, value } = props;
                        const isCritical = value < 95 || value > 100.4;
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isCritical ? 4 : 2}
                            fill={isCritical ? 'red' : 'var(--color-temp)'}
                            stroke="none"
                          />
                        );
                      }}
                    />
                  </RechartsLineChart>
                </ChartContainer>
              </TabsContent>
              <TabsContent value="weight">
                <ChartContainer config={weightChartConfig} className="h-[140px] w-full">
                  <RechartsLineChart data={MOCK_WEIGHT_DATA} margin={{ left: 0, right: 5, top: 5, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={4} fontSize={9} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={4} fontSize={9} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Line
                      dataKey="weight"
                      type="monotone"
                      stroke="var(--color-weight)"
                      strokeWidth={1.5}
                      dot={(props: any) => {
                        const { cx, cy, value } = props;
                        const isCritical = value < 50 || value > 100;
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isCritical ? 4 : 2}
                            fill={isCritical ? 'red' : 'var(--color-weight)'}
                            stroke="none"
                          />
                        );
                      }}
                    />
                  </RechartsLineChart>
                </ChartContainer>
              </TabsContent>
              <TabsContent value="detail-view">
                <Card className="border-0 shadow-none">
                  <ShadcnCardHeader className="pt-2 pb-1 px-3">
                    <CardTitle className="text-base">{detailViewTitle}</CardTitle>
                  </ShadcnCardHeader>
                  <CardContent className="p-3 text-sm text-foreground max-h-[150px] overflow-y-auto no-scrollbar">
                    {detailViewContent.split('\n').map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 shadow-lg h-full">
          <CardContent className="space-y-1.5 p-2 max-h-44 overflow-y-auto no-scrollbar">
            {MOCK_KEY_INDICATORS.map((indicator) => {
              const isActive = indicator.tabValue === activeChartTab;
              return (
                <div
                  key={indicator.name}
                  className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer
                    ${isActive ? 'bg-primary/10 ring-1 ring-primary' : 'bg-muted/70 hover:bg-muted/90'}`}
                  onClick={() => indicator.tabValue && setActiveChartTab(indicator.tabValue)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && indicator.tabValue) setActiveChartTab(indicator.tabValue);
                  }}
                >
                  <div className="flex items-center">
                    {indicator.icon && (
                      <indicator.icon
                        className="h-4 w-4 mr-1.5"
                        style={{ color: isActive && indicator.activeColor ? indicator.activeColor : 'hsl(var(--primary))' }}
                      />
                    )}
                    <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                      {indicator.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-normal ${isActive ? 'text-primary' : 'text-foreground'}`}>
                      {indicator.value}
                    </span>
                    <span className={`text-xs font-normal ml-0.5 ${isActive ? 'text-primary/80' : 'text-foreground/80'}`}>
                      {indicator.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Allergies, Medications, Report, Radiology */}
      <div className="grid grid-cols-1 md:grid-cols-10 gap-3 mb-2">
        {secondRowInformationalCardTitles.map((title) => {
          const IconComponent = infoCardIcons[title] || FileText;
          const items = title === 'Allergies' ? allergies : dynamicPageCardContent[title] || [];
          return (
            <Card
              key={title.toLowerCase().replace(/\s+/g, '-')}
              className={cn('shadow-lg', {
                'md:col-span-2': title === 'Allergies' || title === 'Radiology',
                'md:col-span-3': title === 'Medications History' || title === 'Lab Report',
              })}
            >
              <ShadcnCardHeader className="flex flex-row items-center justify-between pt-2 pb-0 px-3">
                <div className="flex items-center space-x-1.5">
                  <IconComponent className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">
                    {title === 'Medications History' ? 'Medications' : title}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    {title === 'Allergies' ? allergies.length : title === 'Medications History' ? medications.length : (items as string[]).length}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    if (title === 'Medications History') {
                      openFloatingDialog('medication', 'Order Medicines');
                    } else if (title === 'Allergies') {
                      openFloatingDialog('allergies', 'Add New Allergy');
                    } else if (title === 'Radiology') {
                      openFloatingDialog('radiology', 'Order Radiology Test');
                    } else if (title === 'Lab Report') {
                      openFloatingDialog('report', 'Order Report');
                    } else {
                      openFloatingDialog('info-item', `Add New Item to ${title}`, { title });
                    }
                  }}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span className="sr-only">Edit {title}</span>
                </Button>
              </ShadcnCardHeader>
              <CardContent className="p-0 max-h-32 overflow-y-auto no-scrollbar">
                <Table>
                  <TableBody>
                    {title === 'Allergies' ? (
                      (items as Allergy[]).map((allergy: Allergy, index) => (
                        <TableRow
                          key={allergy.id}

                          className={`cursor-pointer hover:bg-muted/50 ${index % 2 === 0 ? 'bg-muted/30' : ''}`} // Keep existing styling
                          onClick={() => {
                            setSelectedAllergy(allergy);
                            setShowAllergyDialog(true);
                          }}
                        >
                          <TableCell className="px-2 py-1">
                            <div className="font-medium text-xs">{`${allergy.allergen} - ${allergy.reaction} (${allergy.severity})`}</div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : title === 'Medications History' ? (
                      medications.map((med, index) => (
                        <TableRow key={med.id} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                          <TableCell className="px-2 py-1">
                            <div className="font-medium text-xs">{med.name}</div>
                          </TableCell>
                          <TableCell className="px-2 py-1 text-right">
                            <div className="text-xs">
                              <span className={`font-medium ${med.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>

                                {med.status}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      (items as string[]).map((item, index) => (
                        <TableRow
                          key={index}

                          className={`cursor-pointer hover:bg-muted/50 ${index % 2 === 0 ? 'bg-muted/30' : ''}`}
                        >
                          <TableCell className="px-2 py-1">
                            <div className="font-medium text-xs">{item}</div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                {(title === 'Allergies' ? allergies.length : title === 'Medications History' ? medications.length : (items as string[]).length) === 0 && (
                  <p className="py-4 text-center text-xs text-muted-foreground">No items listed.</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Third Row: Clinical Notes, Encounter Notes, Clinical Reminder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {thirdRowInformationalCardTitles.map((title) => {
          const IconComponent = infoCardIcons[title] || FileText;
          const items = dynamicPageCardContent[title] || [];
          return (
            <Card key={title.toLowerCase().replace(/\s+/g, '-')} className="shadow-lg">
              <ShadcnCardHeader className="flex flex-row items-center justify-between pt-2 pb-0 px-3">
                <div className="flex items-center space-x-1.5">
                  <IconComponent className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">{title}</CardTitle>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{items.length}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => openFloatingDialog('info-item', `Add New Item to ${title}`, { title })}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span className="sr-only">Edit {title}</span>
                </Button>
              </ShadcnCardHeader>
              <CardContent className="p-0 max-h-24 overflow-y-auto no-scrollbar">
                <Table>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow
                        key={index}

                        className={`cursor-pointer hover:bg-muted/50 ${index % 2 === 0 ? 'bg-muted/30' : ''}`}
                      >
                        <TableCell className="px-2 py-1">
                          <div className="font-medium text-xs">{item}</div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {items.length === 0 && (
                  <p className="py-4 text-center text-xs text-muted-foreground">No items listed.</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Floating Dialogs */}
      {floatingDialogs.map((dialog) => (
        <div
          key={dialog.id}
          ref={(el) => { dialogRefs.current[dialog.id] = el; }}
          className="fixed bg-background border rounded-lg shadow-xl max-h-[90vh] overflow-y-auto sm:w-[45%] sm:max-w-[1000px] z-50"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) translate(${dialog.position.x}px, ${dialog.position.y}px)`,
          }}
          onKeyDown={(e) => handleKeyDown(dialog.id, e)}
          tabIndex={0}
        >
          <div
            className="flex justify-between items-center bg-muted p-2 cursor-grab"
            onMouseDown={(e) => handleMouseDown(dialog.id, e)}
          >
            <h2 className="text-base font-semibold">{dialog.title}</h2>
            <Button variant="ghost" size="icon" onClick={() => closeFloatingDialog(dialog.id)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4">
            {dialog.type === 'problem' && (
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <Label htmlFor={`problemCategory-${dialog.id}`} className="w-[120px] min-w-[120px]">Categories</Label>
                  <Select
                    value={problemInputs[dialog.id]?.category}
                    onValueChange={(value) => setProblemInputs((prev) => ({
                      ...prev,
                      [dialog.id]: { ...prev[dialog.id], category: value as ProblemCategory },
                    }))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Common Problems">Common Problems</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-1">
                    <Checkbox
                      id={`otherProblems-${dialog.id}`}
                      checked={problemInputs[dialog.id]?.other}
                      onCheckedChange={(checked) => setProblemInputs((prev) => ({
                        ...prev,
                        [dialog.id]: { ...prev[dialog.id], other: checked as boolean },
                      }))}
                    />
                    <Label htmlFor={`otherProblems-${dialog.id}`}>Other Problems</Label>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Label className="w-[120px] min-w-[120px] mt-1">Preferred Problems</Label>
                  <div className="grid grid-cols-2 gap-2 flex-1 max-h-40 overflow-y-auto">
                    {[
                      'Anemia (D64.9)', 'Diabetes (E11.9)', 'Dehydration (E86.0)', 'Confusion (F29.)', 'Depression (F32.9)',
                      'Double vision (H53.2)', 'Blurred Vision (H53.8)', 'Defective Vision (H54.7)', 'Eye Pain (H57.13)',
                      'Ear Pain (H60.9)', 'Fever (R50.9)',
                    ].map((problem, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <Checkbox
                          id={`preferred-${dialog.id}-${index}`}
                          checked={problemInputs[dialog.id]?.preferred.includes(problem)}
                          onCheckedChange={(checked) => setProblemInputs((prev) => ({
                            ...prev,
                            [dialog.id]: {
                              ...prev[dialog.id],
                              preferred: checked
                                ? [...prev[dialog.id].preferred, problem]
                                : prev[dialog.id].preferred.filter((p) => p !== problem),
                            },
                          }))}
                        />
                        <Label htmlFor={`preferred-${dialog.id}-${index}`}>{problem}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor={`problemInput-${dialog.id}`} className="w-[120px] min-w-[120px]">Problem</Label>
                  <Input
                    id={`problemInput-${dialog.id}`}
                    value={problemInputs[dialog.id]?.input}
                    onChange={(e) => setProblemInputs((prev) => ({
                      ...prev,
                      [dialog.id]: { ...prev[dialog.id], input: e.target.value },
                    }))}
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor={`problemStatus-${dialog.id}`} className="w-[120px]">Status</Label>
                  <Select
                    value={problemInputs[dialog.id]?.status}
                    onValueChange={(value) => setProblemInputs((prev) => ({
                      ...prev,
                      [dialog.id]: { ...prev[dialog.id], status: value as ProblemStatus },
                    }))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                      <SelectItem value="RESOLVED">RESOLVED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3">
                  <Label className="w-[120px] min-w-[120px]">Immediacy</Label>
                  <RadioGroup
                    value={problemInputs[dialog.id]?.immediacy}
                    onValueChange={(value) => setProblemInputs((prev) => ({
                      ...prev,
                      [dialog.id]: { ...prev[dialog.id], immediacy: value as ProblemImmediacy },
                    }))}
                    className="flex items-center gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Unknown" id={`immediacy-unknown-${dialog.id}`} />
                      <Label htmlFor={`immediacy-unknown-${dialog.id}`}>Unknown</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Acute" id={`immediacy-acute-${dialog.id}`} />
                      <Label htmlFor={`immediacy-acute-${dialog.id}`}>Acute</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Chronic" id={`immediacy-chronic-${dialog.id}`} />
                      <Label htmlFor={`immediacy-chronic-${dialog.id}`}>Chronic</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor={`dateOnset-${dialog.id}`} className="w-[120px] min-w-[120px]">Date of Onset</Label>
                  <Input
                    id={`dateOnset-${dialog.id}`}
                    type="date"
                    value={problemInputs[dialog.id]?.dateOnset}
                    onChange={(e) => setProblemInputs((prev) => ({
                      ...prev,
                      [dialog.id]: { ...prev[dialog.id], dateOnset: e.target.value },
                    }))}
                    className="flex-1"
                  />
                  <Label htmlFor={`problemService-${dialog.id}`} className="w-[120px] min-w-[120px] text-left">Service</Label>
                  <Select
                    value={problemInputs[dialog.id]?.service}
                    onValueChange={(value) => setProblemInputs((prev) => ({
                      ...prev,
                      [dialog.id]: { ...prev[dialog.id], service: value },
                    }))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select Service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cardiology">Cardiology</SelectItem>
                      <SelectItem value="General Medicine">General Medicine</SelectItem>
                      <SelectItem value="Endocrinology">Endocrinology</SelectItem>
                      <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor={`problemComment-${dialog.id}`} className="w-[120px] min-w-[120px]">Comment</Label>
                  <Textarea
                    id={`problemComment-${dialog.id}`}
                    value={problemInputs[dialog.id]?.comment}
                    onChange={(e) => setProblemInputs((prev) => ({
                      ...prev,
                      [dialog.id]: { ...prev[dialog.id], comment: e.target.value },
                    }))}
                    className="flex-1 min-h-[80px]"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button onClick={() => handleAddProblem(dialog.id)}>Create</Button>
                  <Button
                    variant="secondary"
                    onClick={() => setProblemInputs((prev) => ({
                      ...prev,
                      [dialog.id]: {
                        input: '',
                        category: '',
                        other: false,
                        preferred: [],
                        status: '',
                        immediacy: '',
                        dateOnset: '',
                        service: '',
                        comment: '',
                      },
                    }))}
                  >
                    Reset
                  </Button>
                  <Button variant="outline" onClick={() => closeFloatingDialog(dialog.id)}>Cancel</Button>
                </div>
              </div>
            )}
            {dialog.type === 'medication' && (
              <Dialog open={true} onOpenChange={() => closeFloatingDialog(dialog.id)}>
                <DialogContent className="sm:max-w-4xl p-0">
                  <div className="bg-sky-100 p-3 text-xs text-sky-700 flex flex-wrap items-center gap-x-6 gap-y-1">
                    <span>Patient ID: 80000035</span>
                    <span>Name: Anonymous Two</span>
                    <span>Age: 69 Years</span>
                    <span>Sex: MALE</span>
                    <span>Patient Type: In Patient</span>
                  </div>
                  <div className="p-4 flex gap-4 items-end">
                    <div className="flex-1 relative">
                      <label className="block text-sm font-medium">Medication Name</label>
                      <Input
                        value={medSearch}
                        onChange={(e) => {
                          setMedSearch(e.target.value);
                          setDropdownOpen(true);
                          setFilteredMeds(
                            MEDICATIONS.filter((med) =>
                              med.toLowerCase().includes(e.target.value.toLowerCase())
                            )
                          );
                        }}
                        onFocus={() => setDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setDropdownOpen(false), 120)}
                        className="w-full"
                        placeholder="Type to search..."
                        autoComplete="off"
                      />
                      {dropdownOpen && medSearch && (
                        <div className="border rounded bg-white max-h-48 overflow-y-auto absolute z-20 w-full">
                          {filteredMeds.length === 0 ? (
                            <div className="p-2 text-muted-foreground">No medication found.</div>
                          ) : (
                            filteredMeds.map((med) => (
                              <div
                                key={med}
                                className="p-2 hover:bg-sky-100 cursor-pointer"
                                onMouseDown={() => handleSelectMed(med)}
                              >
                                {med}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium">Quick Order</label>
                      <Input
                        value={quickOrder}
                        onChange={(e) => setQuickOrder(e.target.value)}
                        className="w-full"
                        placeholder=""
                      />
                    </div>
                    <Button type="button" className="bg-yellow-500 hover:bg-yellow-600 text-white h-9 text-xs">
                      Edit Quick List
                    </Button>
                  </div>
                  {selectedRows.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full mt-2 border">
                        <thead className="bg-sky-100 text-xs font-light " >
                          <tr>
                            <th className="px-2 py-1">Medicine Name</th>
                            <th className="px-2 py-1">Dosage</th>
                            <th className="px-2 py-1">Route</th>
                            <th className="px-2 py-1">Schedule</th>
                            <th className="px-2 py-1">PRN</th>
                            <th className="px-2 py-1">Duration</th>
                            <th className="px-2 py-1">Priority</th>
                            <th className="px-2 py-1">Additional Dose Now</th>
                            <th className="px-2 py-1">Comment</th>
                            <th className="px-2 py-1">Remove</th>
                            <th className="px-2 py-1">Save Quick Order</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedRows.map((row, idx) => (
                            <tr key={row.medicationName}>
                              <td className="px-2 py-1">{row.medicationName}</td>
                              <td className="px-2 py-1">
                                <Input
                                  value={row.dosage}
                                  onChange={(e) => handleRowChange(idx, 'dosage', e.target.value)}
                                  className="w-20"
                                />
                              </td>
                              <td className="px-2 py-1">
                                <Select
                                  value={row.route}
                                  onValueChange={(val) => handleRowChange(idx, 'route', val)}
                                >
                                  <SelectTrigger className="w-24 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ROUTES.map((route) => (
                                      <SelectItem value={route} key={route}>
                                        {route}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-2 py-1">
                                <Select
                                  value={row.schedule}
                                  onValueChange={(val) => handleRowChange(idx, 'schedule', val)}
                                >
                                  <SelectTrigger className="w-24 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {SCHEDULES.map((schedule) => (
                                      <SelectItem value={schedule} key={schedule}>
                                        {schedule}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-2 py-1 text-center">
                                <Checkbox
                                  checked={row.prn}
                                  onCheckedChange={(val) => handleRowChange(idx, 'prn', val)}
                                />
                              </td>
                              <td className="px-2 py-1 flex items-center">
                                <Input
                                  type="number"
                                  value={row.duration}
                                  onChange={(e) => handleRowChange(idx, 'duration', e.target.value)}
                                  className="w-12"
                                />
                                <Select
                                  value={row.durationUnit}
                                  onValueChange={(val) => handleRowChange(idx, 'durationUnit', val)}
                                >
                                  <SelectTrigger className="w-16 h-8 ml-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="days">days</SelectItem>
                                    <SelectItem value="weeks">weeks</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-2 py-1">
                                <Select
                                  value={row.priority}
                                  onValueChange={(val) => handleRowChange(idx, 'priority', val)}
                                >
                                  <SelectTrigger className="w-24 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {PRIORITIES.map((priority) => (
                                      <SelectItem value={priority} key={priority}>
                                        {priority}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-2 py-1 text-center">
                                <Checkbox
                                  checked={row.additionalDoseNow}
                                  onCheckedChange={(val) => handleRowChange(idx, 'additionalDoseNow', val)}
                                />
                              </td>
                              <td className="px-2 py-1">
                                <Input
                                  value={row.comment}
                                  onChange={(e) => handleRowChange(idx, 'comment', e.target.value)}
                                  className="w-28"
                                />
                              </td>
                              <td className="px-2 py-1 text-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveRow(idx)}
                                >
                                  ❌
                                </Button>
                              </td>
                              <td className="px-2 py-1 text-center">
                                <Button variant="ghost" size="icon">
                                  💾
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="flex justify-end gap-2 p-4">
                    <Button
                      onClick={() => {
                        selectedRows.forEach((row) => {
                          const newMed: Medication = {
                            id: Date.now().toString(),
                            name: row.medicationName,
                            reason: row.comment || 'General',
                            amount: row.dosage || 'N/A',
                            timing: row.schedule || 'N/A',
                            status: 'Active',
                          };
                          setLocalMedications((prev: Medication[]) => [newMed, ...prev]);
                        });
                        toast.success('Medications added successfully!');
                        closeFloatingDialog(dialog.id);
                      }}
                    >
                      Confirm Order
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedRows([])}
                    >
                      Reset
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => closeFloatingDialog(dialog.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {dialog.type === 'radiology' && (
              <div className="flex flex-col gap-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="font-semibold">Patient ID:</span> 800000035</div>
                  <div><span className="font-semibold">Name:</span> Anonymous Two</div>
                  <div><span className="font-semibold">Age:</span> 69 Years</div>
                  <div><span className="font-semibold">Sex:</span> MALE</div>
                  <div className="md:col-span-2"><span className="font-semibold">Patient Type:</span> In Patient</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="w-[120px] min-w-[120px]">Imaging Type</Label>
                    <Select
                      value={radiologyInputs[dialog.id]?.type || ''}
                      onValueChange={(value) =>
                        setRadiologyInputs((prev) => ({
                          ...prev,
                          [dialog.id]: { ...prev[dialog.id], type: value },
                        }))
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select test" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="X-Ray">X-Ray</SelectItem>
                        <SelectItem value="MRI">MRI</SelectItem>
                        <SelectItem value="CT Scan">CT Scan</SelectItem>
                        <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-[120px] min-w-[120px]">Body Part</Label>
                    <Input
                      value={radiologyInputs[dialog.id]?.bodyPart || ''}
                      onChange={(e) =>
                        setRadiologyInputs((prev) => ({
                          ...prev,
                          [dialog.id]: { ...prev[dialog.id], bodyPart: e.target.value },
                        }))
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={radiologyInputs[dialog.id]?.notes || ''}
                    onChange={(e) =>
                      setRadiologyInputs((prev) => ({
                        ...prev,
                        [dialog.id]: { ...prev[dialog.id], notes: e.target.value },
                      }))
                    }
                    className="flex-1 min-h-[80px]"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    onClick={() => {
                      toast.success('Radiology order placed!');
                      closeFloatingDialog(dialog.id);
                    }}
                  >
                    Confirm Order
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setRadiologyInputs((prev) => ({
                        ...prev,
                        [dialog.id]: { type: '', bodyPart: '', notes: '' },
                      }))
                    }
                  >
                    Reset
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => closeFloatingDialog(dialog.id)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            {dialog.type === 'report' && (
              <div className="flex flex-col gap-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Report Search</Label>
                    <Input
                      value={reportInputs[dialog.id]?.search || ''}
                      onChange={(e) =>
                        setReportInputs((prev) => ({
                          ...prev,
                          [dialog.id]: { ...prev[dialog.id], search: e.target.value },
                        }))
                      }
                    />
                    <div className="mt-2 border p-2 h-32 overflow-y-auto text-sm">
                      {['LIVER FUNCTION TEST', 'DSDNA AB', 'THYROID PANEL']
                        .filter((test) => test.toLowerCase().includes((reportInputs[dialog.id]?.search || '').toLowerCase()))
                        .map((test, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Checkbox
                              checked={reportInputs[dialog.id]?.selected.includes(test)}
                              onCheckedChange={(checked) => {
                                setReportInputs((prev) => {
                                  const current = prev[dialog.id]?.selected || [];
                                  return {
                                    ...prev,
                                    [dialog.id]: {
                                      ...prev[dialog.id],
                                      selected: checked
                                        ? [...current, test]
                                        : current.filter((item) => item !== test),
                                    },
                                  };
                                });
                              }}
                            />
                            <span>{test}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div>
                    <Label>Quick Orders</Label>
                    <Input
                      value={reportInputs[dialog.id]?.quickSearch || ''}
                      onChange={(e) =>
                        setReportInputs((prev) => ({
                          ...prev,
                          [dialog.id]: { ...prev[dialog.id], quickSearch: e.target.value },
                        }))
                      }
                    />
                    <div className="mt-2 border p-2 h-32 overflow-y-auto text-sm">
                      {['BLOOD SUGAR', 'CBC', 'ESR']
                        .filter((q) => q.toLowerCase().includes((reportInputs[dialog.id]?.quickSearch || '').toLowerCase()))
                        .map((q, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Checkbox
                              checked={reportInputs[dialog.id]?.selected.includes(q)}
                              onCheckedChange={(checked) => {
                                setReportInputs((prev) => {
                                  const current = prev[dialog.id]?.selected || [];
                                  return {
                                    ...prev,
                                    [dialog.id]: {
                                      ...prev[dialog.id],
                                      selected: checked
                                        ? [...current, q]
                                        : current.filter((item) => item !== q),
                                    },
                                  };
                                });
                              }}
                            />
                            <span>{q}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => {
                      toast.success('Report order confirmed');
                      closeFloatingDialog(dialog.id);
                    }}
                  >
                    Confirm Order
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setReportInputs((prev) => ({
                        ...prev,
                        [dialog.id]: { search: '', quickSearch: '', selected: [] },
                      }))
                    }
                  >
                    Reset
                  </Button>
                  <Button variant="outline" onClick={() => closeFloatingDialog(dialog.id)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            {dialog.type === 'allergies' && (
              <div className="flex flex-col gap-4 text-sm"> {/* Keep existing container class */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`allergen-${dialog.id}`} className="w-[120px] min-w-[120px]">Allergen</Label>
                    <Input
                      id={`allergen-${dialog.id}`}
                      value={allergyInputs[dialog.id]?.allergen}
                      onChange={(e) => setAllergyInputs((prev) => ({
                        ...prev,
                        [dialog.id]: { ...prev[dialog.id], allergen: e.target.value },
                      }))}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`reaction-${dialog.id}`} className="w-[120px] min-w-[120px]">Reaction</Label>
                    <Input
                      id={`reaction-${dialog.id}`}
                      value={allergyInputs[dialog.id]?.reaction}
                      onChange={(e) => setAllergyInputs((prev) => ({
                        ...prev,
                        [dialog.id]: { ...prev[dialog.id], reaction: e.target.value },
                      }))}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`severity-${dialog.id}`} className="w-[120px] min-w-[120px]">Severity</Label>
                    <Select
                      value={allergyInputs[dialog.id]?.severity}
                      onValueChange={(value) => setAllergyInputs((prev) => ({
                        ...prev,
                        [dialog.id]: { ...prev[dialog.id], severity: value as 'Mild' | 'Moderate' | 'Severe' },
                      }))}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mild">Mild</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                        <SelectItem value="Severe">Severe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`dateOnset-${dialog.id}`} className="w-[120px] min-w-[120px]">Date of Onset</Label>
                    <Input
                      id={`dateOnset-${dialog.id}`}
                      type="date"
                      value={allergyInputs[dialog.id]?.dateOnset}
                      onChange={(e) => setAllergyInputs((prev) => ({
                        ...prev,
                        [dialog.id]: { ...prev[dialog.id], dateOnset: e.target.value },
                      }))}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`treatment-${dialog.id}`} className="w-[120px] min-w-[120px]">Treatment</Label>
                    <Input
                      id={`treatment-${dialog.id}`}
                      value={allergyInputs[dialog.id]?.treatment}
                      onChange={(e) => setAllergyInputs((prev) => ({
                        ...prev,
                        [dialog.id]: { ...prev[dialog.id], treatment: e.target.value },
                      }))}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`status-${dialog.id}`} className="w-[120px] min-w-[120px]">Status</Label>
                    <Select
                      value={allergyInputs[dialog.id]?.status}
                      onValueChange={(value) => setAllergyInputs((prev) => ({
                        ...prev,
                        [dialog.id]: { ...prev[dialog.id], status: value as 'Active' | 'Inactive' },
                      }))}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`notes-${dialog.id}`} className="w-[120px] min-w-[120px]">Notes</Label>
                  <Textarea
                    id={`notes-${dialog.id}`}
                    value={allergyInputs[dialog.id]?.notes}
                    onChange={(e) => setAllergyInputs((prev) => ({
                      ...prev,
                      [dialog.id]: { ...prev[dialog.id], notes: e.target.value },
                    }))}
                    className="flex-1 min-h-[80px]"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button onClick={() => handleAddAllergy(dialog.id)}>Add Allergy</Button>
                  <Button
                    variant="secondary"
                    onClick={() => setAllergyInputs((prev) => ({
                      ...prev,
                      [dialog.id]: { allergen: '', reaction: '', severity: '', dateOnset: '', treatment: '', status: '', notes: '' },
                    }))}
                  >
                    Reset
                  </Button>
                  <Button variant="outline" onClick={() => closeFloatingDialog(dialog.id)}>Cancel</Button>
                </div>
              </div>
            )}
            {dialog.type === 'info-item' && (
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4 text-sm">
                  <Label htmlFor={`itemName-${dialog.id}`} className="text-right">Item</Label>
                  <Input
                    id={`itemName-${dialog.id}`}
                    value={infoItemInputs[dialog.id]?.item}
                    onChange={(e) => setInfoItemInputs((prev) => ({
                      ...prev,
                      [dialog.id]: { ...prev[dialog.id], item: e.target.value },
                    }))}
                    className="col-span-3"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button onClick={() => handleSaveNewInfoItem(dialog.id)}>Add Item</Button>
                  <Button variant="outline" onClick={() => closeFloatingDialog(dialog.id)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Problem Detail Dialog */}
      <Dialog open={showProblemDialog} onOpenChange={setShowProblemDialog}>
        <DialogContent className="sm:max-w-[425px] p-0 rounded-lg overflow-hidden" style={{ padding: 0 }}>
          <div className="bg-sky-200 px-3 py-2 text-sm font-semibold text-sky-800">Problem View</div> {/* Keep existing header class */}
          <div className="p-4 text-sm">
            <div className="mb-3 font-bold">{selectedProblem?.description || 'Anemia (D64.9)'}</div>
            <div className="grid grid-cols-1 gap-1">
              <div><span className="font-medium">Onset:</span> {selectedProblem?.dateOnset}</div> {/* Use actual data */}
              <div><span className="font-medium">Status:</span> {selectedProblem?.status}</div> {/* Use actual data */}
              <div><span className="font-medium">SC Cond:</span> NO</div>
              <div><span className="font-medium">Exposure:</span> None</div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-1">
              <div><span className="font-medium">Provider:</span> DOCTOR,SANSYS</div>
              <div><span className="font-medium">Clinic:</span> ICU ONE</div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-1 text-muted-foreground text-xs">
              <div>Recorded: , by DOCTOR,SANSYS</div>
              <div>Entered: 1/10/24, by DOCTOR,SANSYS</div>
              <div>Updated: 1/10/24</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Allergy Detail Dialog */}
      <Dialog open={showAllergyDialog} onOpenChange={setShowAllergyDialog}>
        <DialogContent className="sm:max-w-[425px] p-0 rounded-lg overflow-hidden" style={{ padding: 0 }}>
          <div className="bg-sky-200 px-3 py-2 text-sm font-semibold text-sky-800">Allergy View</div>
          <div className="p-4 text-sm">
            <div className="mb-3 font-bold">{`${selectedAllergy?.allergen} - ${selectedAllergy?.reaction}`}</div>
            <div className="grid grid-cols-1 gap-1">
              <div><span className="font-medium">Severity:</span> {selectedAllergy?.severity}</div>
              <div><span className="font-medium">Onset:</span> {selectedAllergy?.dateOnset || 'Not specified'}</div>
              <div><span className="font-medium">Status:</span> {selectedAllergy?.status}</div>
              <div><span className="font-medium">Treatment:</span> {selectedAllergy?.treatment || 'None'}</div>
              <div><span className="font-medium">Notes:</span> {selectedAllergy?.notes || 'None'}</div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-1">
              <div><span className="font-medium">Created By:</span> {selectedAllergy?.createdBy}</div>
              <div><span className="font-medium">Created At:</span> {selectedAllergy?.createdAt ? new Date(selectedAllergy.createdAt).toLocaleString() : 'Not specified'}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>




    </div>
  );
}
