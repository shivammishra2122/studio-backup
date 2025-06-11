'use client';

import type { NextPage } from 'next';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit3, RefreshCw, ArrowUpDown, MessageSquare, FileSignature, Trash2, CheckCircle2 } from 'lucide-react';
import { Patient } from '@/services/api';

type SummaryEntryDataType = {
  id: string;
  summaryTitle: string;
  dateOfEntry: string;
  status: "UNSIGNED" | "COMPLETED";
  signedBy?: string;
  author: string;
  location: string;
  cosigner?: string;
};

const mockSummaryEntries: SummaryEntryDataType[] = [
  {
    id: '1',
    summaryTitle: 'Ortho: Improved post-op, less pain, f/u 4w', // 40 characters
    dateOfEntry: '17 MAY, 2025 12:00',
    status: 'UNSIGNED',
    author: 'Internalmed Doc Primary Care',
    location: 'ICU ONE - General Ward, Bed A101',
    cosigner: 'Sansys Doctor Supervising MD',
  },
  {
    id: '2',
    summaryTitle: 'Neuro: Stable post-op, no deficits, f/u MRI', // 40 characters
    dateOfEntry: '12 JUL, 2023 16:09',
    status: 'COMPLETED',
    author: 'Sansys Doctor Neuro Team',
    location: 'ICU ONE - Neuro ICU, Bed N203',
    cosigner: 'Sansys Doctor Head of Neurosurgery',
  },
  {
    id: '3',
    summaryTitle: 'Cardio: MI, PCI, stable, meds, rehab', // 35 characters
    dateOfEntry: '05 AUG, 2024 11:30',
    status: 'COMPLETED',
    author: 'Dr. Cardio Heart Specialist',
    location: 'CCU - Coronary Care Unit, Bed C5',
    cosigner: 'Dr. SeniorCardio Chief Cardiologist',
  },
];

interface DischargeSummaryPageProps {
  patient?: Patient;
}

const DischargeSummaryPage: NextPage<DischargeSummaryPageProps> = ({ patient }) => {
  const [showEntries, setShowEntries] = useState<string>("10");
  const [visitDate, setVisitDate] = useState<string>("15 MAY, 2025 19:45");
  const [searchText, setSearchText] = useState<string>("");

  const filteredSummaries = mockSummaryEntries;

  return (
    <div className="flex-1 flex flex-col px-3 pb-3 pt-0 gap-3 overflow-hidden h-[calc(100vh-var(--top-nav-height,60px))]">
      <Card className="flex-1 flex flex-col shadow overflow-hidden">
        <CardHeader className="p-2.5 border-b bg-card text-foreground rounded-t-md">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Discharge Summaries Details</CardTitle>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-muted/50">
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-muted/50">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-2.5 flex-1 flex flex-col overflow-hidden">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center space-x-2 text-xs mb-2 gap-y-2">
            <Label htmlFor="showEntries" className="shrink-0">Show</Label>
            <Select value={showEntries} onValueChange={setShowEntries}>
              <SelectTrigger id="showEntries" className="h-7 w-20 text-xs">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <Label className="shrink-0">entries</Label>

            <div className="flex-grow"></div>

            <Label htmlFor="visitDate" className="shrink-0">Visit Date</Label>
            <Select value={visitDate} onValueChange={setVisitDate}>
              <SelectTrigger id="visitDate" className="h-7 w-40 text-xs">
                <SelectValue placeholder="Select Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15 MAY, 2025 19:45">15 MAY, 2025 19:45</SelectItem>
                <SelectItem value="12 JUL, 2023 16:09">12 JUL, 2023 16:09</SelectItem>
                <SelectItem value="05 AUG, 2024 11:30">05 AUG, 2024 11:30</SelectItem>
              </SelectContent>
            </Select>

            <Label htmlFor="summarySearch" className="shrink-0">Search:</Label>
            <Input id="summarySearch" type="text" value={searchText} onChange={e => setSearchText(e.target.value)} className="h-7 w-32 text-xs" />
          </div>

          {/* Table Section */}
          <div className="flex-1 overflow-y-auto min-h-0 relative">
            <Table className="text-xs w-full">
              <TableHeader className="bg-background sticky top-0 z-10 border-b">
                <TableRow>
                  {[
                    { name: "Discharge Summaries Title", className: "w-[30%]" },
                    { name: "Date of Entry", className: "w-[15%]" },
                    { name: "Status", className: "w-[10%]" },
                    { name: "Sign", className: "w-[7%]" },
                    { name: "Edit", className: "w-[7%]" },
                    { name: "Delete", className: "w-[7%]" },
                    { name: "Action", className: "w-[7%]" },
                    { name: "Author", className: "w-[10%]" },
                    { name: "Location", className: "w-[15%]" },
                    { name: "Cosigner", className: "w-[12%]" },
                  ].map(header => (
                    <TableHead key={header.name} className={`py-2 px-3 text-foreground font-semibold h-8 ${header.className}`}>
                      <div className="flex items-center justify-between">
                        {header.name}
                        <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground hover:text-foreground cursor-pointer" />
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSummaries.length > 0 ? filteredSummaries.map((summary, index) => (
                  <TableRow key={summary.id} className={`hover:bg-muted/30 ${index % 2 === 0 ? 'bg-muted/30' : ''}`}>
                    <TableCell className="py-1.5 px-3 whitespace-normal">{summary.summaryTitle}</TableCell>
                    <TableCell className="py-1.5 px-3 whitespace-normal">{summary.dateOfEntry}</TableCell>
                    <TableCell className="py-1.5 px-3 whitespace-normal">{summary.status}</TableCell>
                    <TableCell className="py-1.5 px-3 text-center">
                      {summary.status === "COMPLETED" ?
                        <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" /> :
                        <Button variant="ghost" size="icon" className="h-6 w-6"><FileSignature className="h-3.5 w-3.5" /></Button>
                      }
                    </TableCell>
                    <TableCell className="py-1.5 px-3 text-center">
                      <Button variant="ghost" size="icon" className="h-6 w-6"><Edit3 className="h-3.5 w-3.5" /></Button>
                    </TableCell>
                    <TableCell className="py-1.5 px-3 text-center">
                      <Button variant="ghost" size="icon" className="h-6 w-6"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </TableCell>
                    <TableCell className="py-1.5 px-3 text-center">
                      <Button variant="ghost" size="icon" className="h-6 w-6"><MessageSquare className="h-3.5 w-3.5" /></Button>
                    </TableCell>
                    <TableCell className="py-1.5 px-3 whitespace-normal">{summary.author}</TableCell>
                    <TableCell className="py-1.5 px-3 whitespace-normal">{summary.location}</TableCell>
                    <TableCell className="py-1.5 px-3 whitespace-normal">{summary.cosigner || '-'}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-10 text-muted-foreground">
                      No discharge summaries found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-2.5 border-t text-xs text-muted-foreground mt-auto">
            <div>Showing {filteredSummaries.length > 0 ? 1 : 0} to {filteredSummaries.length} of {filteredSummaries.length} entries</div>
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1">Previous</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1 bg-accent text-foreground border-border">1</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DischargeSummaryPage;