'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Printer } from 'lucide-react';
import { Patient } from '@/services/api';

interface ApiPatient {
  DFN: string;
  Name: string;
  Gender: string;
  Age: number | string;
  DOB: string;
  Ward: string;
  Bed: string;
  "Admission Date": string;
  LOS: string;
  "Mobile No": string;
  "Primary Consultant": string;
  Specialty: string;
  "Treating Consultant": string;
}

const labSubNavItems = ["Most Recent", "Cumulative", "Lab Test", "Results & Graph"];

type LabResultEntryType = {
  labTest: string;
  results: string;
  units: string;
  refRange: string;
  isOutOfRange?: boolean;
};

// Mock data for lab results
const mockLabResults: LabResultEntryType[] = [
  {
    labTest: "Hemoglobin",
    results: "14.2",
    units: "g/dL",
    refRange: "13.5-17.5",
  },
  {
    labTest: "White Blood Cells",
    results: "11.5",
    units: "K/uL",
    refRange: "4.5-11.0",
    isOutOfRange: true,
  },
  {
    labTest: "Platelets",
    results: "250",
    units: "K/uL",
    refRange: "150-450",
  },
  {
    labTest: "Sodium",
    results: "140",
    units: "mmol/L",
    refRange: "135-145",
  },
  {
    labTest: "Potassium",
    results: "4.0",
    units: "mmol/L",
    refRange: "3.5-5.0",
  },
];

export default function LabPage({ patient }: { patient?: Patient }) {
  const { id } = useParams();
  const [activeSubNav, setActiveSubNav] = useState(labSubNavItems[0]);

  // Mock patient data for display purposes
  const mockPatient: ApiPatient = {
    DFN: id as string,
    Name: "John Doe", // Replace with actual patient name fetching logic
    Gender: "Male",
    Age: 45,
    DOB: "01/15/1978",
    Ward: "Cardiology",
    Bed: "101",
    "Admission Date": "10/26/2023",
    LOS: "5 days",
    "Mobile No": "555-123-4567",
    "Primary Consultant": "Dr. Smith",
    Specialty: "Cardiology",
    "Treating Consultant": "Dr. Jones",
  };

  return (
    <div className="flex flex-col h-[calc(100vh-var(--top-nav-height,40px))] bg-background text-sm px-2 pb-2 pt-0">
      {/* Horizontal Sub-Navigation Bar */}
      <div className="flex items-end space-x-1 px-1 pb-0 overflow-x-auto no-scrollbar">
        {labSubNavItems.map((item) => (
          <Button
            key={item}
            onClick={() => setActiveSubNav(item)}
            className={`text-xs px-3 py-1.5 h-auto rounded-b-none rounded-t-md whitespace-nowrap focus-visible:ring-0 focus-visible:ring-offset-0
              ${activeSubNav === item
                ? 'bg-background text-primary border-x border-t border-border border-b-2 border-b-background shadow-sm relative -mb-px z-10 hover:bg-background hover:text-primary'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground border-x border-t border-transparent'
              }`}
          >
            {item}
          </Button>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col gap-3 overflow-hidden">
        {activeSubNav === "Most Recent" && (
          <Card className="flex-1 flex flex-col shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-3">
              <CardTitle className="text-base">Lab Results</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-muted/50">
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 min-h-0">
                <Table className="text-xs">
                  <TableHeader className="sticky top-0 bg-muted z-10">
                    <TableRow>
                      <TableHead className="py-2 px-3 font-semibold text-foreground w-[30%]">Lab Test</TableHead>
                      <TableHead className="py-2 px-3 font-semibold text-foreground w-[20%]">Results</TableHead>
                      <TableHead className="py-2 px-3 font-semibold text-foreground w-[20%]">Units</TableHead>
                      <TableHead className="py-2 px-3 font-semibold text-foreground w-[30%]">Ref Range</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockLabResults.map((result) => (
                      <TableRow key={result.labTest} className="hover:bg-muted/30">
                        <TableCell className={`py-1.5 px-3 ${result.isOutOfRange ? 'font-bold' : ''}`}>{result.labTest}</TableCell>
                        <TableCell className={`py-1.5 px-3 ${result.isOutOfRange ? 'font-bold' : ''}`}>{result.results}</TableCell>
                        <TableCell className="py-1.5 px-3">{result.units}</TableCell>
                        <TableCell className={`py-1.5 px-3 ${result.isOutOfRange ? 'font-bold' : ''}`}>{result.refRange}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              <div className="flex items-center justify-between p-2 border-t">
                <div className="flex space-x-4 text-xs text-muted-foreground">
                  <span>Specimen: BLOOD</span>
                  <span>Accession: HE 0825 7</span>
                  <span>Provider: DOCTOR,SAN</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-muted/50">
                  <Printer className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSubNav !== "Most Recent" && (
          <Card className="flex-1 flex items-center justify-center shadow-sm">
            <CardContent className="text-center">
              <CardTitle className="text-xl text-muted-foreground">
                {activeSubNav} View
              </CardTitle>
              <p className="text-sm text-muted-foreground">Content for this section is not yet implemented.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
