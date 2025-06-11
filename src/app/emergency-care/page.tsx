'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader as ShadcnTableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardFooter, CardHeader as ShadcnCardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpDown, RefreshCw, CalendarDays } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Patient } from '@/services/api';

// MLC/Non-MLC Note Data Type
type MLCNonMLCNoteDataType = {
  id: string;
  noteType: "MLC" | "Non-MLC";
  noteTitle: string;
  date: string;
  time: string;
  status: "DRAFT" | "COMPLETED" | "PENDING";
  author: string;
  location: string;
  patient: string;
};

// Mock MLC/Non-MLC Note Data
const mockMLCNonMLCNotes: MLCNonMLCNoteDataType[] = [
  { id: '1', noteType: 'MLC', noteTitle: 'MLC Note - Road Traffic Accident involving a pedestrian', date: '20 MAY, 2025', time: '09:00', status: 'COMPLETED', author: 'Dr. Sharma', location: 'Emergency Ward Bay 1', patient: 'John Doe' },
  { id: '2', noteType: 'Non-MLC', noteTitle: 'Non-MLC Note - Acute Chest Pain, possible ACS', date: '21 MAY, 2025', time: '14:30', status: 'DRAFT', author: 'Dr. Gupta', location: 'Resuscitation Room 2', patient: 'Jane Smith' },
];

const MLCNonMLCNoteView = () => {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [showEntries, setShowEntries] = useState<string>("10");
  const [searchText, setSearchText] = useState<string>("");

  const filteredNotes = mockMLCNonMLCNotes;

  const mlcNonMLCTableHeaders = [
    { name: "Note Type", className: "w-[10%]" },
    { name: "Note Title", className: "w-[25%]" },
    { name: "Date/Time", className: "w-[15%]" },
    { name: "Status", className: "w-[10%]" },
    { name: "Author", className: "w-[15%]" },
    { name: "Location", className: "w-[15%]" },
    { name: "Patient", className: "w-[10%]" },
  ];

  return (
    <Card className="flex-1 flex flex-col shadow overflow-hidden">
      <ShadcnCardHeader className="p-2.5 border-b bg-card text-foreground rounded-t-md">
        <div className="flex flex-wrap items-center justify-between gap-y-2">
          <CardTitle className="text-base font-semibold mr-auto">MLC/Non-MLC Notes</CardTitle>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-xs">
            <Label htmlFor="mlcStatus" className="shrink-0">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="mlcStatus" className="h-7 w-24 text-xs">
                <SelectValue placeholder="ALL" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">ALL</SelectItem>
                <SelectItem value="DRAFT">DRAFT</SelectItem>
                <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                <SelectItem value="PENDING">PENDING</SelectItem>
              </SelectContent>
            </Select>
            <Label htmlFor="mlcFromDate" className="text-xs shrink-0">From</Label>
            <div className="relative">
              <Input id="mlcFromDate" type="text" value={fromDate} onChange={e => setFromDate(e.target.value)} className="h-7 w-24 text-xs pr-7" />
              <CalendarDays className="h-3.5 w-3.5 absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
            <Label htmlFor="mlcToDate" className="text-xs shrink-0">To</Label>
            <div className="relative">
              <Input id="mlcToDate" type="text" value={toDate} onChange={e => setToDate(e.target.value)} className="h-7 w-24 text-xs pr-7" />
              <CalendarDays className="h-3.5 w-3.5 absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
            <Label htmlFor="showEntries" className="text-xs shrink-0">Show</Label>
            <Select value={showEntries} onValueChange={setShowEntries}>
              <SelectTrigger id="showEntries" className="h-7 w-20 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <Label htmlFor="showEntries" className="text-xs shrink-0">entries</Label>
            <Label htmlFor="mlcSearch" className="text-xs shrink-0">Search:</Label>
            <Input id="mlcSearch" type="text" value={searchText} onChange={e => setSearchText(e.target.value)} className="h-7 w-32 text-xs" />
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-muted/50">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </ShadcnCardHeader>
      <CardContent className="p-2.5 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto min-h-0">
          <Table className="text-xs w-full">
            <ShadcnTableHeader className="bg-accent sticky top-0 z-10">
              <TableRow>
                {mlcNonMLCTableHeaders.map(header => (
                  <TableHead key={header.name} className={`py-2 px-3 text-foreground font-semibold h-auto ${header.className}`}>
                    <div className="flex items-center justify-between">
                      <span className="break-words text-xs">{header.name}</span>
                      <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground hover:text-foreground cursor-pointer" />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </ShadcnTableHeader>
            <TableBody>
              {filteredNotes.length > 0 ? filteredNotes.map((note, index) => (
                <TableRow key={note.id} className={`hover:bg-muted/50 ${index % 2 === 0 ? 'bg-muted/30' : ''}`}>
                  <TableCell className="py-1.5 px-3">{note.noteType}</TableCell>
                  <TableCell className="py-1.5 px-3">{note.noteTitle}</TableCell>
                  <TableCell className="py-1.5 px-3">{note.date} {note.time}</TableCell>
                  <TableCell className="py-1.5 px-3">{note.status}</TableCell>
                  <TableCell className="py-1.5 px-3">{note.author}</TableCell>
                  <TableCell className="py-1.5 px-3">{note.location}</TableCell>
                  <TableCell className="py-1.5 px-3">{note.patient}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={mlcNonMLCTableHeaders.length} className="text-center py-10 text-muted-foreground">
                    No Data Found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between p-2.5 border-t text-xs text-muted-foreground mt-auto">
          <div>Showing {filteredNotes.length > 0 ? 1 : 0} to {filteredNotes.length} of {filteredNotes.length} entries</div>
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1">Previous</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1 bg-accent text-foreground border-border">1</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1">Next</Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-2.5 border-t flex justify-center space-x-2">
        <Button size="sm" className="text-xs bg-orange-400 hover:bg-orange-500 text-white h-8">Create MLC Note</Button>
        <Button size="sm" className="text-xs bg-orange-400 hover:bg-orange-500 text-white h-8">Create Non-MLC Note</Button>
        <Button size="sm" className="text-xs bg-orange-400 hover:bg-orange-500 text-white h-8">Print Note</Button>
      </CardFooter>
    </Card>
  );
};

const PatientCOPDListView = () => {
  const [copdShowEntries, setCopdShowEntries] = useState<string>("10");
  const [copdFromDate, setCopdFromDate] = useState<string>("");
  const [copdToDate, setCopdToDate] = useState<string>("");
  const [copdTypeFilter, setCopdTypeFilter] = useState<string>("Both");
  const [copdCriticalityFilter, setCopdCriticalityFilter] = useState<string>("All");
  const [copdSearchText, setCopdSearchText] = useState<string>("");

  const copdTableHeaders = [
    "Visit Date/Time", "Type", "MLC", "MLC/Progress Id", "Treating Facility",
    "Injury", "Criticality", "Consultant Name", "Attended By",
    "Referred From", "Brought By", "Brought By Name"
  ];

  return (
    <Card className="flex-1 flex flex-col shadow overflow-hidden">


      <CardContent className="p-2.5 flex-1 flex flex-col overflow-hidden">
        {/* Filter Bars */}
        <div className="space-y-2 mb-2 text-xs">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">

            <Label htmlFor="copdFromDate" className="shrink-0 text-xs">From Date</Label>
            <div className="relative">
              <Input id="copdFromDate" type="text" value={copdFromDate} onChange={e => setCopdFromDate(e.target.value)} className="h-7 w-24 text-xs pr-7" />
              <CalendarDays className="h-3.5 w-3.5 absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
            <Label htmlFor="copdToDate" className="shrink-0 text-xs">To</Label>
            <div className="relative">
              <Input id="copdToDate" type="text" value={copdToDate} onChange={e => setCopdToDate(e.target.value)} className="h-7 w-24 text-xs pr-7" />
              <CalendarDays className="h-3.5 w-3.5 absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
            <Label htmlFor="copdTypeFilter" className="shrink-0 text-xs">Type</Label>
            <Select value={copdTypeFilter} onValueChange={setCopdTypeFilter}>
              <SelectTrigger id="copdTypeFilter" className="h-7 w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Both">Both</SelectItem>
                <SelectItem value="MLC">MLC</SelectItem>
                <SelectItem value="Progress">Progress</SelectItem>
              </SelectContent>
            </Select>
            <Label htmlFor="copdCriticalityFilter" className="shrink-0 text-xs">Criticality</Label>
            <Select value={copdCriticalityFilter} onValueChange={setCopdCriticalityFilter}>
              <SelectTrigger id="copdCriticalityFilter" className="h-7 w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Label htmlFor="copdShowEntries" className="text-xs shrink-0">Show</Label>
              <Select value={copdShowEntries} onValueChange={setCopdShowEntries}>
                <SelectTrigger id="copdShowEntries" className="h-7 w-16 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <Label htmlFor="copdShowEntries" className="text-xs shrink-0">entries</Label>
              <div className="flex-grow"></div>
              <Label htmlFor="copdSearch" className="text-xs shrink-0">Search:</Label>
              <Input id="copdSearch" type="text" value={copdSearchText} onChange={e => setCopdSearchText(e.target.value)} className="h-7 w-32 text-xs" />
            </div>
          </div>

        </div>

        <div className="flex-1 overflow-auto min-h-0">
          <Table className="text-xs w-full">
            <ShadcnTableHeader className="bg-accent sticky top-0 z-10">
              <TableRow>
                {copdTableHeaders.map(header => (
                  <TableHead key={header} className="py-2 px-3 text-foreground h-auto">
                    <div className="flex items-center justify-between">
                      <span className="break-words text-xs">{header}</span> {/* Allow header text to wrap */}
                      <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground hover:text-foreground cursor-pointer" />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </ShadcnTableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={copdTableHeaders.length} className="text-center py-10 text-muted-foreground">
                  No Data Found
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="mt-auto pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1 px-1">
            <span>Showing 0 to 0 of 0 entries</span>
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="sm" className="h-6 text-xs px-1.5 py-0.5">Previous</Button>
              <Button variant="outline" size="sm" className="h-6 text-xs px-1.5 py-0.5 bg-accent text-foreground border-border">1</Button>
              <Button variant="outline" size="sm" className="h-6 text-xs px-1.5 py-0.5">Next</Button>
            </div>
          </div>
          <Progress value={0} className="h-1.5 w-full bg-muted" />
        </div>
      </CardContent>
      <CardFooter className="p-2.5 border-t flex justify-center space-x-2">
        <Button size="sm" className="text-xs bg-orange-400 hover:bg-orange-500 text-white h-8">Create MLC</Button>
        <Button size="sm" className="text-xs bg-orange-400 hover:bg-orange-500 text-white h-8">Create Progress</Button>
        <Button size="sm" className="text-xs bg-orange-400 hover:bg-orange-500 text-white h-8">Print MLC Report</Button>
        <Button size="sm" className="text-xs bg-orange-400 hover:bg-orange-500 text-white h-8">Print Progress Note</Button>
      </CardFooter>
    </Card>
  );
};

const subNavItems = ["COPD List", "MLC/Non-MLC Note"];

const EmergencyCarePage = ({ patient }: { patient?: Patient }) => {
  const [activeSubNav, setActiveSubNav] = useState<string>(subNavItems[0]);

  return (
    <div className="flex flex-col h-[calc(100vh-var(--top-nav-height,40px))] bg-background text-sm px-3 pb-3 pt-0">
      {/* Horizontal Navigation Bar */}
      <div className="flex items-end space-x-1 px-1 pb-0 overflow-x-auto no-scrollbar">
        {subNavItems.map((item) => (
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

      <main className="flex-1 flex flex-col gap-3 overflow-hidden">
        {activeSubNav === "COPD List" && <PatientCOPDListView />}
        {activeSubNav === "MLC/Non-MLC Note" && <MLCNonMLCNoteView />}
      </main>
    </div>
  );
};

export default EmergencyCarePage;

