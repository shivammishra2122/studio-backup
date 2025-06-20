'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; // Ensure this path is correct
import {
  Settings,
  FileEdit,
  RefreshCw,
  CalendarDays,
  ArrowUpDown,
  Ban,
  FileText,
  Printer,
  Download,
  Filter,
  PenLine,
  ChevronsUpDown,
  Check,
  X as XIcon,
  Save,
  Pencil,
  Copy
} from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle as DialogUITitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import IpMedicationOrderDialog from './IpMedicationOrderDialog';
import type { Patient } from '@/lib/constants';
import type { NextPage } from 'next';
import { apiService } from '@/services/api'; // Import api

// Add OrdersPageProps interface
interface OrdersPageProps {
  patient: Patient;
}

// Navigation items
const orderSubNavItems = [
  "CPOE Order List",
  "Write Delay Order",
  "IP Medication",
  "Laboratory",
  "Radiology",
  "Visit/ADT",
  "Procedure Order",
  "Nursing Care"
];

// Data Types and Mock Data

// CPOE Order List Data
type OrderDataType = {
  id: string;
  service: string;
  order: string;
  orderNote?: string;
  startDate: string;
  startTime: string;
  stopDate?: string;
  stopTime?: string;
  provider: string;
  status: "UNRELEASED" | "ACTIVE" | "Completed" | "Pending" | "Cancelled";
  location: string;
};

const mockOrderData: OrderDataType[] = [
  {
    id: '1',
    service: 'Inpt. Meds',
    order: 'AMOXICILLIN 250MG UD CAP 250MG PO BID(08&20HRS) PRN',
    orderNote: 'First Dose NOW *UNSIGNED*',
    startDate: '17 MAY, 2025',
    startTime: '20:00',
    provider: 'Sansys Doctor',
    status: 'UNRELEASED',
    location: 'ICU ONE'
  },
  {
    id: '2',
    service: 'Inpt. Meds',
    order: 'AEROCORT ROTACAP 1 ROTACAP INHL BID(08&20HRS)',
    startDate: '17 MAY, 2025',
    startTime: '20:00',
    stopDate: '19 MAY, 2025',
    stopTime: '20:00',
    provider: 'Internalmed Doc',
    status: 'ACTIVE',
    location: 'ICU ONE'
  },
  {
    id: '3',
    service: 'Inpt. Meds',
    order: 'DIGOXIN PAED UD SYRUP 60ML BTL 10ML PO STAT(ONE TIME ONLY) STAT',
    startDate: '17 MAY, 2025',
    startTime: '13:00',
    stopDate: '18 MAY, 2025',
    stopTime: '13:00',
    provider: 'Internalmed Doc',
    status: 'ACTIVE',
    location: 'ICU ONE'
  },
  {
    id: '4',
    service: 'Inpt. Meds',
    order: 'CARMICIDE PAED SYRUP 100ML BTL 10 ML PO BID(08&20HRS)',
    startDate: '17 MAY, 2025',
    startTime: '20:00',
    stopDate: '22 MAY, 2025',
    stopTime: '20:00',
    provider: 'Internalmed Doc',
    status: 'ACTIVE',
    location: 'ICU ONE'
  },
];

type VisitAdtDataType = {
  id: string;
  event: string;
  dateTime: string;
  provider: string;
  status: "COMPLETED" | "DISCONTINUED";
  location: string;
};

// Mock Visit/ADT Data
const mockVisitAdtData: VisitAdtDataType[] = [
  {
    id: '1',
    event: 'ADMISSION TO LAJPATNAGAR',
    dateTime: '23 NOV, 2024 11:30',
    provider: 'Ess User',
    status: 'COMPLETED',
    location: 'BLK-EMERGENCY WARD'
  },
  {
    id: '2',
    event: 'TRANSFER TO ICU',
    dateTime: '16 NOV, 2024 15:34',
    provider: 'Dr. Sharma',
    status: 'COMPLETED',
    location: 'BLK-ICU WARD'
  },
  {
    id: '3',
    event: 'DISCHARGE',
    dateTime: '10 JAN, 2025 09:00',
    provider: 'Dr. Gupta',
    status: 'DISCONTINUED',
    location: 'BLK-GENERAL WARD'
  },
  {
    id: '4',
    event: 'ADMISSION TO OPD',
    dateTime: '05 MAR, 2025 14:20',
    provider: 'Ess User',
    status: 'COMPLETED',
    location: 'OPD WARD'
  },
  {
    id: '5',
    event: 'TRANSFER TO GENERAL WARD',
    dateTime: '15 APR, 2025 10:45',
    provider: 'Dr. Patel',
    status: 'COMPLETED',
    location: 'BLK-GENERAL WARD'
  },
];

// IP Medication Data
interface VisitData {
  VST_DATE: string;
  VST_DFT: string | number;
  VST_HOS: string;
  VST_IEN: string | number;
  VST_TYP: string;
}

interface VisitApiResponse {
  [key: string]: VisitData;
}

interface IpMedicationEntryDataType {
  id: string;
  services: string;
  medicationName: string;
  status: string;
  startDate: string;
  startTime?: string;
  stopDate?: string;
  stopTime?: string;
  orderedBy: string;
  medicationDay: string;
  orderURL: string;
  schedule?: string;
  scheduleNote?: string;
  signURL?: string;
  discontinueURL?: string;
  changeURL?: string;
  copyURL?: string;
  releaseURL?: string;
  renewURL?: string;
}

const mockIpMedicationData: IpMedicationEntryDataType[] = [];

const ALL_AVAILABLE_MEDICATIONS = [
  "ALBUMIN BOUND PACLITAXEL-100.000-MG",
  "AGREGATE TAB", "ALLEGRA M TAB", "ALLEGRA UD 120MG", "ALLEGRA UD 180MG",
  "ALLEGRA UD 30MG", "ALLEGRA UD 30MG SYRUP", "ARGIPREG PLUS SACHET POUCH",
  "CAPEGARD UD 500MG TAB", "DEGARELIX 80MG UD VIAL INJ", "DILTEGESIC ORGANOGEL UD 2%W/V",
  "PARACETAMOL 500MG", "IBUPROFEN 200MG", "AMOXICILLIN 250MG", "ASPIRIN 100MG", "METFORMIN 500MG"
];

// Delay Orders Data
type DelayOrderDataType = {
  id: string;
  event: string;
  order: string;
  startDate: string;
  startTime: string;
  stopDate?: string;
  stopTime?: string;
  status: "UNRELEASED" | "ACTIVE" | "Completed" | "Pending" | "Cancelled";
  orderedBy: string;
};

const mockDelayOrderData: DelayOrderDataType[] = [
  // Intentionally empty to match "No Data Found" in the screenshot
];

// Lab CPOE List Data
type LabCpoeDataType = {
  id: string;
  section: string;
  labTest: string;
  sample: string;
  orderDate: string;
  orderTime: string;
  startDate: string;
  startTime: string;
  status: "UNRELEASED" | "ACTIVE" | "Completed" | "Pending" | "Cancelled";
};

const mockLabCpoeData: LabCpoeDataType[] = [
  { id: '1', section: 'CHEMISTRY', labTest: 'VITAMIN C - ASCORBIC ACID (SERUM)', sample: 'UNKNOWN', orderDate: '26 MAR, 2025', orderTime: '10:48', startDate: '', startTime: '', status: 'UNRELEASED' },
  { id: '2', section: 'CHEMISTRY', labTest: 'AFB SENSITIVITY (12 DRUGS PANEL)', sample: 'BRONCHUS AND ALVEOLUS, CS', orderDate: '22 JAN, 2025', orderTime: '15:58', startDate: '', startTime: '', status: 'UNRELEASED' },
  { id: '3', section: 'CHEMISTRY', labTest: 'VITAMIN C - ASCORBIC ACID (SERUM)', sample: 'UNKNOWN', orderDate: '22 JAN, 2025', orderTime: '15:58', startDate: '', startTime: '', status: 'UNRELEASED' },
  { id: '4', section: 'CHEMISTRY', labTest: 'HCV IGG', sample: 'SERUM', orderDate: '22 JAN, 2025', orderTime: '15:58', startDate: '', startTime: '', status: 'UNRELEASED' },
  { id: '5', section: 'MICROBIOLOGY', labTest: 'ALBERT STAIN', sample: 'UNKNOWN', orderDate: '18 JAN, 2025', orderTime: '11:04', startDate: '', startTime: '', status: 'UNRELEASED' },
  { id: '6', section: 'CHEMISTRY', labTest: '17 HYDROXYPROGESTERONE (17 - OHP)', sample: 'UNKNOWN', orderDate: '18 JAN, 2025', orderTime: '11:00', startDate: '', startTime: '', status: 'UNRELEASED' },
  { id: '7', section: 'CHEMISTRY', labTest: 'ALLERGY 11 PANEL DRUG PANEL (M)', sample: 'SERUM', orderDate: '17 JAN, 2025', orderTime: '16:47', startDate: '', startTime: '', status: 'UNRELEASED' },
  { id: '8', section: 'CHEMISTRY', labTest: 'ALLERGY 11 PANEL DRUG PANEL (M)', sample: 'SERUM', orderDate: '17 JAN, 2025', orderTime: '16:47', startDate: '', startTime: '', status: 'UNRELEASED' },
  { id: '9', section: 'CHEMISTRY', labTest: 'ALLERGEN F13 - PEANUT', sample: 'SERUM', orderDate: '17 JAN, 2025', orderTime: '16:44', startDate: '', startTime: '', status: 'UNRELEASED' },
];

type RadiologyDataType = {
  id: string;
  testName: string;
  orderDate: string;
  orderTime: string;
  startDate?: string;
  startTime?: string;
  provider: string;
  status: "UNRELEASED" | "PENDING" | "COMPLETED";
  location: string;
};

// Mock Radiology Data
const mockRadiologyData: RadiologyDataType[] = [
  {
    id: '1',
    testName: 'X-RAY CHEST PA',
    orderDate: '16 MAY, 2024',
    orderTime: '16:22',
    startDate: '16 MAY, 2024',
    startTime: '16:30',
    provider: 'Atul Prasad',
    status: 'COMPLETED',
    location: 'BLK-EMERGENCY WARD'
  },
  {
    id: '2',
    testName: 'CT SCAN BRAIN',
    orderDate: '09 NOV, 2024',
    orderTime: '15:43',
    startDate: '09 NOV, 2024',
    startTime: '16:00',
    provider: 'Ess User',
    status: 'PENDING',
    location: 'BLK-EMERGENCY WARD'
  },
  {
    id: '3',
    testName: 'MRI SPINE',
    orderDate: '20 JAN, 2025',
    orderTime: '09:15',
    startDate: '20 JAN, 2025',
    startTime: '09:30',
    provider: 'Dr. Sharma',
    status: 'UNRELEASED',
    location: 'RADIOLOGY DEPT'
  },
  {
    id: '4',
    testName: 'ULTRASOUND ABDOMEN',
    orderDate: '15 MAR, 2025',
    orderTime: '11:00',
    startDate: '15 MAR, 2025',
    startTime: '11:15',
    provider: 'Dr. Gupta',
    status: 'COMPLETED',
    location: 'BLK-EMERGENCY WARD'
  },
  {
    id: '5',
    testName: 'X-RAY KNEE AP/LAT',
    orderDate: '10 APR, 2025',
    orderTime: '14:20',
    provider: 'Ess User',
    status: 'PENDING',
    location: 'OPD RADIOLOGY'
  },
];

// Components

// CPOE Order List View
const CpoeOrderListView = ({ patient }: { patient: Patient }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingLabOrders, setLoadingLabOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visitDateFilter, setVisitDateFilter] = useState<string>("");
  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [orderFromDate, setOrderFromDate] = useState<string>("");
  const [orderToDate, setOrderToDate] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [showEntries, setShowEntries] = useState<string>("10");
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    setLoadingLabOrders(true);
    setError(null);

    if (!patient?.ssn) {
      console.error('No patient SSN available');
      setError('Patient SSN is required');
      setLoadingLabOrders(false);
      return;
    }

    const requestBody = {
      UserName: 'CPRS-UAT',
      Password: 'UAT@123',
      PatientSSN: patient.ssn, // Use direct SSN access
      DUZ: '115',
      ihtLocation: 102,
      FromDate: '',
      ToDate: '',
      rcpAdmDateL: '11435762',
      rcpoeSerOrd: '6',
    };

    fetch('http://3.6.230.54:4003/api/apiOrdCPOEList.sh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!data || Object.keys(data).length === 0) {
          setOrders([]);
          setError('No data found');
        } else {
          // Assuming data is an object where values are the order entries
          const ordersArray = Object.values(data).map((item: any) => ({
            id: item.ID?.toString() || item.Order?.toString() || Date.now().toString() + Math.random().toString(36).slice(2, 9), // Use a unique ID
            Service: item.Service || 'N/A',
            Order: item.Order || 'N/A',
            'Start Date': item['Start Date'] || '',
            'Start Time': item['Start Time'] || '',
            'Stop Date': item['Stop Date'] || '',
            'Stop Time': item['Stop Time'] || '',
            Provider: item.Provider || 'N/A',
            Status: item.Status || 'UNKNOWN',
            Location: item.Location || 'N/A',
          }));
          setOrders(ordersArray);
        }
      })
      .catch((err) => {
        console.error('Error fetching orders:', err);
        setError('Failed to fetch orders: ' + err.message);
      })
      .finally(() => setLoadingLabOrders(false));
  }, [patient]);

  const filteredOrders = orders.filter(order => {
    const serviceMatch = serviceFilter ? order.Service.toLowerCase() === serviceFilter.toLowerCase() : true;
    const statusMatch = statusFilter ? order.Status.toLowerCase() === statusFilter.toLowerCase() : true;
    const dateMatch = orderFromDate && orderToDate ? order['Start Date'] >= orderFromDate && order['Start Date'] <= orderToDate : true;
    const searchMatch = searchText ? Object.values(order).some((value) => (value as any)?.toString().toLowerCase().includes(searchText.toLowerCase())) : true;
    return serviceMatch && statusMatch && dateMatch && searchMatch;
  });

  const totalPages = Math.ceil(filteredOrders.length / parseInt(showEntries));
  const startIndex = (currentPage - 1) * parseInt(showEntries);
  const endIndex = startIndex + parseInt(showEntries);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  if (loadingLabOrders) {
    return (
      <Card className="flex-1 flex items-center justify-center">
        <CardContent className="text-center">
          <p className="text-muted-foreground">Loading orders...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex-1 flex items-center justify-center">
        <CardContent className="text-center">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1 flex flex-col shadow overflow-hidden">
      <CardHeader className="p-1.5 border-b bg-card text-foreground rounded-t-md">
        <CardTitle className="text-base font-semibold">CPOE Order List</CardTitle>
      </CardHeader>
      <CardContent className="p-1.5 flex-1 flex flex-col overflow-hidden">
        <div className="space-y-1 mb-2 text-xs">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Label htmlFor="visitDate" className="shrink-0">Visit Date</Label>
            <Select value={visitDateFilter} onValueChange={setVisitDateFilter}>
              <SelectTrigger id="visitDate" className="h-7 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15 MAY, 2025 19:4">15 MAY, 2025 19:4</SelectItem>
              </SelectContent>
            </Select>
            <Label htmlFor="service" className="shrink-0">Service</Label>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger id="service" className="h-7 w-24 text-xs">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All" key="all-services">All</SelectItem>
                {Array.from(new Set(orders.map(order => order.Service))).map(service => (
                  <SelectItem key={`service-${service}`} value={service}>{service}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label htmlFor="status" className="shrink-0">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status" className="h-7 w-24 text-xs">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All" key="all-status">All</SelectItem>
                {Array.from(new Set(orders.map(order => order.Status))).map(status => (
                  <SelectItem key={`status-${status}`} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label htmlFor="orderFrom" className="shrink-0">Order From</Label>
            <div className="relative">
              <Input id="orderFrom" type="text" value={orderFromDate} onChange={e => setOrderFromDate(e.target.value)} className="h-7 w-24 text-xs pr-7" aria-label="Lab Order From Date" placeholder="DD/MM/YYYY" />
              <CalendarDays className="h-3.5 w-3.5 absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
            <Label htmlFor="orderTo" className="shrink-0">Order To</Label>
            <div className="relative">
              <Input id="orderTo" type="text" value={orderToDate} onChange={e => setOrderToDate(e.target.value)} className="h-7 w-24 text-xs pr-7" aria-label="Lab Order To Date" placeholder="DD/MM/YYYY" />
              <CalendarDays className="h-3.5 w-3.5 absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <div className="flex items-center space-x-1">
              <Label htmlFor="showEntries" className="text-xs shrink-0">Show</Label>
              <Select value={showEntries} onValueChange={setShowEntries}>
                <SelectTrigger id="showEntries" className="h-7 w-16 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10" key="entries-10">10</SelectItem>
                  <SelectItem value="25" key="entries-25">25</SelectItem>
                  <SelectItem value="50" key="entries-50">50</SelectItem>
                </SelectContent>
              </Select>
              <Label htmlFor="showEntries" className="text-xs shrink-0">entries</Label>
            </div>
            <div className="flex-grow"></div>
            <Label htmlFor="search" className="shrink-0">Search:</Label>
            <Input id="search" type="text" value={searchText} onChange={e => setSearchText(e.target.value)} className="h-7 w-40 text-xs" />
          </div>
        </div>

        <div className="flex-1 overflow-auto min-h-0">
          <Table className="text-xs w-full">
            <TableHeader className="bg-accent sticky top-0 z-10">
              <TableRow>
                <TableHead className="py-1 px-2 text-xs h-auto">
                  <div className="flex items-center justify-between">
                    Service
                    <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground hover:text-foreground cursor-pointer" />
                  </div>
                </TableHead>
                <TableHead className="py-1 px-2 text-xs h-auto">
                  <div className="flex items-center justify-between">
                    Order
                    <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground hover:text-foreground cursor-pointer" />
                  </div>
                </TableHead>
                <TableHead className="py-1 px-2 text-xs h-auto">
                  <div className="flex items-center justify-between">
                    Start/Stop Date
                    <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground hover:text-foreground cursor-pointer" />
                  </div>
                </TableHead>
                <TableHead className="py-1 px-2 text-xs h-auto">
                  <div className="flex items-center justify-between">
                    Provider
                    <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground hover:text-foreground cursor-pointer" />
                  </div>
                </TableHead>
                <TableHead className="py-1 px-2 text-xs h-auto">
                  <div className="flex items-center justify-between">
                    Status
                    <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground hover:text-foreground cursor-pointer" />
                  </div>
                </TableHead>
                <TableHead className="py-1 px-2 text-xs h-auto">
                  <div className="flex items-center justify-between">
                    Location
                    <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground hover:text-foreground cursor-pointer" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.length > 0 ? paginatedOrders.map((order, index) => (
                <TableRow key={`order-${order.id || order.Service}-${order.Order}`} className={`${index % 2 === 0 ? 'bg-muted/30' : ''}`}>
                  <TableCell className="py-1 px-2">{order.Service}</TableCell>
                  <TableCell className="py-1 px-2">{order.Order}</TableCell>
                  <TableCell className="py-1 px-2">
                    {order['Start Date'] && order['Start Time'] ? `Start: ${order['Start Date']} ${order['Start Time']}` : ''}
                    {order['Stop Date'] && order['Stop Time'] ? <><br />{`Stop: ${order['Stop Date']} ${order['Stop Time']}`}</> : null}
                  </TableCell>
                  <TableCell className="py-1 px-2">{order.Provider}</TableCell>
                  <TableCell className="py-1 px-2 text-xs">{order.Status}</TableCell>
                  <TableCell className="py-1 px-2">{order.Location}</TableCell>
                </TableRow>
              )) : (
                <TableRow key="no-orders">
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between p-1.5 border-t text-xs text-muted-foreground mt-auto">
          <div>Showing {paginatedOrders.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} entries</div>
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1 bg-accent text-foreground border-border">{currentPage}</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const IpMedicationView = ({ patient }: { patient: Patient }) => {
  const [ipMedicationList, setIpMedicationList] = useState<IpMedicationEntryDataType[]>([]);
  const [isAddIpMedicationDialogOpen, setIsAddIpMedicationDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [medicationError, setMedicationError] = useState<string | null>(null);
  const [visitDate, setVisitDate] = useState<string | undefined>(undefined);
  
  // Fetch medications when component mounts or patient changes
  useEffect(() => {
    const fetchMedications = async () => {
      if (!patient?.ssn) {
        console.log('No patient SSN available');
        setLoading(false);
        return;
      }

      setLoading(true);
      setMedicationError(null);
      
      try {
        // TODO: Replace with actual IP medication API endpoint
        // This is just a placeholder - adjust according to your actual API
        const response = await fetch('YOUR_IP_MEDICATION_API_ENDPOINT', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            patientSsn: patient.ssn,
            // Add other required parameters
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Transform the response to match IpMedicationEntryDataType
        // Adjust this according to your actual API response structure
        const medications = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          services: value.services || 'Inpt. Meds',
          medicationName: value.medicationName || 'Unknown Medication',
          status: value.status || 'UNKNOWN',
          startDate: value.startDate || '',
          startTime: value.startTime || '',
          stopDate: value.stopDate || '',
          stopTime: value.stopTime || '',
          orderedBy: value.orderedBy || 'Unknown',
          medicationDay: value.medicationDay || '1',
          orderURL: value.orderURL || '#',
          schedule: value.schedule || '',
          signURL: value.signURL,
          discontinueURL: value.discontinueURL,
          changeURL: value.changeURL,
          copyURL: value.copyURL
        }));
        
        setIpMedicationList(medications);
      } catch (error) {
        console.error('Error fetching medications:', error);
        setMedicationError('Failed to load medication data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMedications();
  }, [patient?.ssn]);

  // This effect is now handled by the main fetchMedications function
  // No need for a separate effect for visit-based fetching
  
  const [scheduleType, setScheduleType] = useState<string | undefined>();
  const [status, setStatus] = useState<string>("all");
  const [orderFrom, setOrderFrom] = useState<string>("");
  const [orderTo, setOrderTo] = useState<string>("");
  const [showEntries, setShowEntries] = useState<string>("All");
  const [searchText, setSearchText] = useState<string>("");
  const [loadingLabOrders, setLoadingLabOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const openOrderMedicinesDialog = () => {
    setIsAddIpMedicationDialogOpen(true);
  };

  const handleConfirmOrder = (rows: any[]) => {
    const newMedications: IpMedicationEntryDataType[] = rows.map(row => ({
      id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
      services: 'Inpt. Meds',
      medicationName: row.medicationName,
      status: 'UNRELEASED',
      startDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      stopDate: '',
      stopTime: '',
      orderedBy: 'System (Dialog)',
      medicationDay: 'Day 1',
      orderURL: '#', // Required field
      schedule: row.schedule === 'SELECT' ? 'Pending' : row.schedule,
      scheduleNote: row.prn ? 'PRN' : row.comment || undefined,
    }));

    setIpMedicationList(prev => [...newMedications, ...prev]);
    setIsAddIpMedicationDialogOpen(false);
  };

  const ipMedTableHeaders = ["Services", "Medication Name", "Start/Stop Date", "Status", "Ordered By", "Sign", "Discontinue", "Actions", "Medication Day", "Schedule"];

  useEffect(() => {
    setLoadingLabOrders(true);
    setError(null);

    if (!patient?.ssn) {
      setError('Patient SSN not available.');
      setLoadingLabOrders(false);
      return;
    }

    const requestBody = {
      UserName: 'CPRS-UAT',
      Password: 'UAT@123',
      PatientSSN: patient.ssn, // Use direct SSN access
      DUZ: '115',
      rcpoeOrdIP: 99,
      rordFrmDtPha: '',
      rordToDtPha: ''
    };
    
    console.log('Fetching IP medications for SSN:', patient.ssn);
    
    console.log('Sending request to API with body:', JSON.stringify(requestBody, null, 2));
    
    fetch('http://3.6.230.54:4003/api/apiOrdMedList.sh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
      .then(async response => {
        console.log('Received response status:', response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('API Response Data:', data);
        
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid data format received from server');
        }
        
        // Convert the response object to an array of medications
        const medications = Object.entries(data).map(([key, med]: [string, any]) => {
          if (typeof med !== 'object' || med === null) {
            console.warn('Unexpected medication data format:', med);
            return null;
          }
          
          return {
            id: med['Order IEN']?.toString() || key,
            services: med.Services || 'Inpt. Meds',
            medicationName: med['Medication Name'] || 'Unknown Medication',
            status: med.Status || 'UNKNOWN',
            startDate: med['Start Date'] || '',
            stopDate: med['Stop Date'] || '',
            orderedBy: med['Ordered By'] || 'Unknown',
            medicationDay: med['Medication Day'] || '',
            orderURL: med.OrderURL || med['View Order'] || '#',
            signURL: med.Sign || '',
            discontinueURL: med.Discontinue || '',
            changeURL: med.Change || '',
            copyURL: med.Copy || '',
            flagURL: med.Flag || '',
            unflagURL: med.Unflag || '',
            holdURL: med.Hold || '',
            releaseURL: med.Release || '',
            renewURL: med.Renew || ''
          };
        }).filter(Boolean) as IpMedicationEntryDataType[]; // Filter out any null entries
        
        if (medications.length === 0) {
          setError('No medication records found for this patient');
        } else {
          setIpMedicationList(medications);
        }
      })
      .catch(error => {
        console.error('Error fetching IP medications:', error);
        setError(`Failed to load medication data: ${error.message || 'Unknown error occurred'}`);
      })
      .finally(() => {
        setLoadingLabOrders(false);
      });
  }, [patient]); // Depend on patient to refetch if it changes

  return (
    <Card className="flex-1 flex flex-col shadow overflow-hidden">
      <CardHeader className="p-1.5 border-b bg-card text-foreground rounded-t-md">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">IPD Medication List</CardTitle>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-muted/50" onClick={openOrderMedicinesDialog}><FileEdit className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-muted/50"><RefreshCw className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-muted/50"><Settings className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-muted/50"><Printer className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-muted/50"><Download className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-muted/50"><Filter className="h-4 w-4" /></Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-1.5 flex-1 flex flex-col overflow-hidden">
        <div className="space-y-1 mb-2 text-xs">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Label htmlFor="ipVisitDate" className="shrink-0">Visit Date</Label>
            <Select value={visitDate} onValueChange={setVisitDate}>
              <SelectTrigger id="ipVisitDate" className="h-7 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15 MAY, 2025 19:4">15 MAY, 2025 19:4</SelectItem>
              </SelectContent>
            </Select>
            <Label htmlFor="ipStatus" className="shrink-0">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="ipStatus" className="h-7 w-24 text-xs">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="HOLD">HOLD</SelectItem>
                <SelectItem value="UNRELEASED">UNRELEASED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Loading medication data...</p>
          </div>
        ) : medicationError ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-destructive">{medicationError}</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-accent sticky top-0 z-10">
                <TableRow>
                  <TableHead className="py-1 px-2 text-xs">Services</TableHead>
                  <TableHead className="py-1 px-2 text-xs">Medication Name</TableHead>
                  <TableHead className="py-1 px-2 text-xs">Start/Stop Date</TableHead>
                  <TableHead className="py-1 px-2 text-xs">Status</TableHead>
                  <TableHead className="py-1 px-2 text-xs">Ordered By</TableHead>
                  <TableHead className="py-1 px-2 text-xs">Sign</TableHead>
                  <TableHead className="py-1 px-2 text-xs">Discontinue</TableHead>
                  <TableHead className="py-1 px-2 text-xs">Actions</TableHead>
                  <TableHead className="py-1 px-2 text-xs">Medication Day</TableHead>
                  <TableHead className="py-1 px-2 text-xs">Schedule</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ipMedicationList.length > 0 ? (
                  ipMedicationList.map((med, index) => (
                    <TableRow key={med.id} className={`text-xs ${index % 2 === 0 ? 'bg-muted/30' : ''}`}>
                      <TableCell className="py-1 px-2 font-normal">
                        {med.services}
                      </TableCell>
                      <TableCell className="py-1 px-2 font-normal">
                        <a href={med.orderURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {med.medicationName}
                        </a>
                      </TableCell>
                      <TableCell className="py-1 px-2 font-normal">
                        {med.startDate && `Start: ${med.startDate} ${med.startTime || ''}`}
                        {med.stopDate && (
                          <>
                            <br />
                            {`Stop: ${med.stopDate} ${med.stopTime || ''}`}
                          </>
                        )}
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <Badge 
                          variant={
                            med.status?.toUpperCase() === 'UNRELEASED' ? 'secondary' : 
                            med.status?.toUpperCase() === 'ACTIVE' ? 'default' :
                            med.status?.toUpperCase() === 'DISCONTINUED' ? 'destructive' : 'outline'
                          }
                          className="text-[11px] font-normal capitalize"
                        >
                          {med.status?.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-1 px-2 font-normal">
                        {med.orderedBy}
                      </TableCell>
                      <TableCell className="py-1 px-2 font-normal">
                        {med.signURL && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 p-0" asChild>
                                <a href={med.signURL} target="_blank" rel="noopener noreferrer" title="Sign">
                                  <PenLine className="h-3 w-3" />
                                </a>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs">Sign Order</TooltipContent>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell className="py-1 px-2 font-normal">
                        {med.discontinueURL && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 p-0" asChild>
                                <a href={med.discontinueURL} target="_blank" rel="noopener noreferrer" title="Discontinue">
                                  <Ban className="h-3 w-3 text-red-500" />
                                </a>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs">Discontinue</TooltipContent>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell className="py-1 px-2 font-normal">
                        <div className="flex gap-1">
                          {med.changeURL && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 p-0" asChild>
                                  <a href={med.changeURL} target="_blank" rel="noopener noreferrer" title="Change">
                                    <Pencil className="h-3 w-3" />
                                  </a>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">Change Order</TooltipContent>
                            </Tooltip>
                          )}
                          {med.copyURL && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 p-0" asChild>
                                  <a href={med.copyURL} target="_blank" rel="noopener noreferrer" title="Copy">
                                    <Copy className="h-3 w-3" />
                                  </a>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">Copy Order</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-1 px-2 font-normal">
                        {med.medicationDay || 'N/A'}
                      </TableCell>
                      <TableCell className="py-1 px-2 font-normal">
                        {med.schedule || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-10 text-muted-foreground">
                      No medication orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex items-center justify-between p-2.5 border-t text-xs text-muted-foreground mt-auto">
          <div>
            Showing {ipMedicationList.length > 0 ? 1 : 0} to {ipMedicationList.length} of {ipMedicationList.length} entries
          </div>
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

// Delay Orders View
const DelayOrdersView = () => {
  const [delayOrderView, setDelayOrderView] = useState<string>("Delay Order List");
  const [eventFilter, setEventFilter] = useState<string>("ADMISSION TO LAJPATNAGAR");
  const [showEntries, setShowEntries] = useState<string>("10");
  const [searchText, setSearchText] = useState<string>("");

  const filteredDelayOrders = mockDelayOrderData;

  const delayOrderTableHeaders = ["S.No.", "Event", "Order", "Start/Stop Date", "Status", "Ordered By", "Sign", "Discontinue", "Change Event", "Release Order", "Order View"];

  return (
    <Card className="flex-1 flex flex-col shadow overflow-hidden">
      <CardHeader className="p-2.5 border-b bg-card text-foreground rounded-t-md">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Delay Orders - List/Events</CardTitle>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-muted/50">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-muted/50">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2.5 flex-1 flex flex-col overflow-hidden">
        <div className="space-y-2 mb-2 text-xs">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="delayOrderList"
                name="delayOrderView"
                value="Delay Order List"
                checked={delayOrderView === "Delay Order List"}
                onChange={() => setDelayOrderView("Delay Order List")}
                className="h-4 w-4 text-blue-600"
                title="Delay Order List"
              />
              <Label htmlFor="delayOrderList" className="text-xs">Delay Order List</Label>
              <input
                type="radio"
                id="delayOrderEvents"
                name="delayOrderView"
                value="Delay Order Events"
                checked={delayOrderView === "Delay Order Events"}
                onChange={() => setDelayOrderView("Delay Order Events")}
                className="h-4 w-4 text-blue-600"
                title="Delay Order Events"
              />
              <Label htmlFor="delayOrderEvents" className="text-xs">Delay Order Events</Label>
            </div>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="h-7 w-48 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMISSION TO LAJPATNAGAR">ADMISSION TO LAJPATNAGAR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="flex items-center space-x-1">
              <Label htmlFor="delayShowEntries" className="text-xs shrink-0">Show</Label>
              <Select value={showEntries} onValueChange={setShowEntries}>
                <SelectTrigger id="delayShowEntries" className="h-7 w-16 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <Label htmlFor="delayShowEntries" className="text-xs shrink-0">entries</Label>
            </div>
            <div className="flex-grow"></div>
            <Label htmlFor="delaySearch" className="shrink-0">Search:</Label>
            <Input id="delaySearch" type="text" value={searchText} onChange={e => setSearchText(e.target.value)} className="h-7 w-40 text-xs" />
          </div>
        </div>

        <div className="flex-1 overflow-auto min-h-0">
          <Table className="text-xs w-full">
            <TableHeader className="bg-accent sticky top-0 z-10">
              <TableRow>
                {delayOrderTableHeaders.map(header => (
                  <TableHead key={header} className="py-1 px-3 text-xs h-auto">
                    <div className="flex items-center justify-between">
                      {header}
                      <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground hover:text-foreground cursor-pointer" />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDelayOrders.length > 0 ? filteredDelayOrders.map((order, index) => (
                <TableRow key={order.id} className={`${index % 2 === 0 ? 'bg-muted/30' : ''}`}>
                  <TableCell className="py-1.5 px-3">{index + 1}</TableCell>
                  <TableCell className="py-1.5 px-3">{order.event}</TableCell>
                  <TableCell className="py-1.5 px-3">{order.order}</TableCell>
                  <TableCell className="py-1.5 px-3">
                    <div>Start: {order.startDate} {order.startTime}</div>
                    {order.stopDate && <div>Stop: {order.stopDate} {order.stopTime}</div>}
                  </TableCell>
                  <TableCell className="py-1.5 px-3 text-xs">{order.status}</TableCell>
                  <TableCell className="py-1.5 px-3">{order.orderedBy}</TableCell>
                  <TableCell className="py-1.5 px-3 text-center"><Button variant="ghost" size="icon" className="h-6 w-6"><PenLine className="h-3.5 w-3.5 text-blue-600" /></Button></TableCell>
                  <TableCell className="py-1.5 px-3 text-center"><Button variant="ghost" size="icon" className="h-6 w-6"><Ban className="h-3.5 w-3.5 text-red-500" /></Button></TableCell>
                  <TableCell className="py-1.5 px-3 text-center"><Button variant="ghost" size="icon" className="h-6 w-6"><FileText className="h-3.5 w-3.5 text-blue-600" /></Button></TableCell>
                  <TableCell className="py-1.5 px-3 text-center"><Button variant="ghost" size="icon" className="h-6 w-6"><FileText className="h-3.5 w-3.5 text-blue-600" /></Button></TableCell>
                  <TableCell className="py-1.5 px-3 text-center"><Button variant="ghost" size="icon" className="h-6 w-6"><FileText className="h-3.5 w-3.5 text-blue-600" /></Button></TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={delayOrderTableHeaders.length} className="text-center py-10 text-muted-foreground">
                    No Data Found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between p-2.5 border-t text-xs text-muted-foreground mt-auto">
          <div>Showing {filteredDelayOrders.length > 0 ? 1 : 0} to {filteredDelayOrders.length} of {filteredDelayOrders.length} entries</div>
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

const RadiologyView = ({ patient }: { patient: Patient }) => {
  const [visitDate, setVisitDate] = useState<string | undefined>("16 MAY, 2024 16:22");
  const [statusFilter, setStatusFilter] = useState<string | undefined>("All");
  const [orderFromDate, setOrderFromDate] = useState<string>("");
  const [orderToDate, setOrderToDate] = useState<string>("");
  const [showEntries, setShowEntries] = useState<string>("All");
  const [searchText, setSearchText] = useState<string>("");
  const [radiologyOrders, setRadiologyOrders] = useState<any[]>([]);
  const [loadingLabOrders, setLoadingLabOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoadingLabOrders(true);
    setError(null);

    if (!patient?.ssn) {
      setError('Patient SSN not available.');
      setLoadingLabOrders(false);
      return;
    }

    const requestBody = {
      UserName: "CPRS-UAT",
      Password: "UAT@123",
      PatientSSN: patient.ssn, // Use direct SSN access
      DUZ: "115",
      ihtLocation: 102,
      FromDate: orderFromDate, // Using state for date filters
      ToDate: orderToDate, // Using state for date filters
      rcpoeOrdSt: "11"
    };

    try {
      const response = await fetch('http://3.6.230.54:4003/api/apiOrdRadListNew.sh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Radiology API response:', data);

      if (!data || Object.keys(data).length === 0 || data.errors) {
        setRadiologyOrders([]);
        setError('No data found');
      } else {
        // Assuming data is an object where values are the radiology entries
        const ordersArray = Object.values(data).map((item: any) => ({
          id: item['Order IEN']?.toString() || item['Imaging Procedure'] || Date.now().toString() + Math.random().toString(36).slice(2, 9),
          testName: item['Imaging Procedure'] || 'N/A',
          orderDate: item['Exam Date/Time'] ? item['Exam Date/Time'].split(' ')[0] : '',
          orderTime: item['Exam Date/Time'] ? item['Exam Date/Time'].split(' ')[1] : '',
          startDate: '', // API response doesn't seem to have separate start/stop dates
          startTime: '',
          provider: item.Provider || 'N/A',
          status: item.Status as any || 'UNKNOWN',
          location: item.Location || 'N/A',
          result: item.Result || '' // Add result field from API
        }));
        setRadiologyOrders(ordersArray);
      }
    } catch (err: any) {
      console.error('Error fetching radiology orders:', err);
      setError('Failed to fetch radiology orders: ' + err.message);
    } finally {
      setLoadingLabOrders(false);
    }
  }, [patient, orderFromDate, orderToDate]); // Depend on patient and date filters

  const filteredRadiologyOrders = radiologyOrders.filter(order => {
    const matchesSearch = searchText === '' ||
      order["Imaging Procedure"].toLowerCase().includes(searchText.toLowerCase()) ||
      order["Imaging Type"].toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = statusFilter === 'All' || order.Status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const radiologyTableHeaders = ["Imaging Procedure", "Imaging Type", "Exam Date/Time", "Provider", "Status", "Sign", "Discontinue", "Result", "Location"];

  return (
    <Card className="flex-1 flex flex-col shadow overflow-hidden">
      <CardHeader className="p-2.5 border-b bg-card text-foreground rounded-t-md">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Radiology Orders</CardTitle>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-muted/50">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-muted/50">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-muted/50">
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-muted/50">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-muted/50">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2.5 flex-1 flex flex-col overflow-hidden">
        <div className="space-y-2 mb-2 text-xs">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Label htmlFor="radiologyVisitDate" className="shrink-0">Visit Date</Label>
            <Select value={visitDate} onValueChange={setVisitDate}>
              <SelectTrigger id="radiologyVisitDate" className="h-7 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="16 MAY, 2024 16:22">16 MAY, 2024 16:22</SelectItem>
              </SelectContent>
            </Select>
            <Label htmlFor="radiologyStatus" className="shrink-0">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="radiologyStatus" className="h-7 w-24 text-xs">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="UNRELEASED">UNRELEASED</SelectItem>
                <SelectItem value="PENDING">PENDING</SelectItem>
                <SelectItem value="COMPLETED">COMPLETED</SelectItem>
              </SelectContent>
            </Select>
            <Label htmlFor="radiologyOrderFrom" className="shrink-0">Order From</Label>
            <div className="relative">
              <Input
                id="radiologyOrderFrom"
                type="text"
                value={orderFromDate}
                onChange={e => setOrderFromDate(e.target.value)}
                className="h-7 w-24 text-xs pr-7"
                aria-label="Radiology Order From Date"
                placeholder="DD/MM/YYYY"
              />
              <CalendarDays className="h-3.5 w-3.5 absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
            <Label htmlFor="radiologyOrderTo" className="shrink-0">Order To</Label>
            <div className="relative">
              <Input
                id="radiologyOrderTo"
                type="text"
                value={orderToDate}
                onChange={e => setOrderToDate(e.target.value)}
                className="h-7 w-24 text-xs pr-7"
                aria-label="Radiology Order To Date"
                placeholder="DD/MM/YYYY"
              />
              <CalendarDays className="h-3.5 w-3.5 absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="flex items-center space-x-1">
              <Label htmlFor="radiologyShowEntries" className="text-xs shrink-0">Show</Label>
              <Select value={showEntries} onValueChange={setShowEntries}>
                <SelectTrigger id="radiologyShowEntries" className="h-7 w-20 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                </SelectContent>
              </Select>
              <Label htmlFor="radiologyShowEntries" className="text-xs shrink-0">entries</Label>
            </div>
            <div className="flex-grow"></div>
            <Label htmlFor="radiologySearch" className="shrink-0">Search:</Label>
            <Input id="radiologySearch" type="text" value={searchText} onChange={e => setSearchText(e.target.value)} className="h-7 w-40 text-xs" />
          </div>
        </div>

        <div className="flex-1 overflow-auto min-h-0">
          {loadingLabOrders ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-destructive">{error}</p>
            </div>
          ) : (
            <Table className="text-xs w-full">
              <TableHeader className="bg-accent sticky top-0 z-10">
                <TableRow>
                  {radiologyTableHeaders.map(header => (
                    <TableHead key={header} className="py-1 px-3 text-xs h-auto">
                      <div className="flex items-center justify-between">
                        {header}
                        <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground hover:text-foreground cursor-pointer" />
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRadiologyOrders.length > 0 ? filteredRadiologyOrders.map((order, index) => (
                  <TableRow key={`radiology-${order["Order IEN"] || order["Imaging Procedure"]}`} className={`${index % 2 === 0 ? 'bg-muted/30' : ''}`}>
                    <TableCell className="py-1.5 px-3 whitespace-normal">{order.testName}</TableCell>
                    <TableCell className="py-1.5 px-3 whitespace-normal">N/A</TableCell> {/* Imaging Type not available in mapped data */}
                    <TableCell className="py-1.5 px-3 whitespace-normal">{order.orderDate} {order.orderTime}</TableCell>
                    <TableCell className="py-1.5 px-3 whitespace-normal">{order.provider}</TableCell>
                    <TableCell className="py-1.5 px-3 text-xs whitespace-normal">{order.status}</TableCell>
                    <TableCell className="py-1.5 px-3 text-center">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <PenLine className="h-3.5 w-3.5 text-blue-600" />
                      </Button>
                    </TableCell>
                    <TableCell className="py-1.5 px-3 text-center">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Ban className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </TableCell>
                    <TableCell className="py-1.5 px-3">{order.result}</TableCell>
                    <TableCell className="py-1.5 px-3">{order.location}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={radiologyTableHeaders.length} className="text-center py-10 text-muted-foreground">
                      No radiology orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="flex items-center justify-between p-2.5 border-t text-xs text-muted-foreground mt-auto">
          <div>Showing {filteredRadiologyOrders.length > 0 ? 1 : 0} to {filteredRadiologyOrders.length} of {filteredRadiologyOrders.length} entries</div>
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

// Lab CPOE List View
const LabCpoeListView = ({ patient }: { patient: Patient }) => {
  const [labOrders, setLabOrders] = useState<LabCpoeDataType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionFilter, setSectionFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showEntries, setShowEntries] = useState<string>("10");
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    if (!patient) return;
    
    if (!patient?.ssn) {
      setError('Patient SSN not available');
      setLoading(false);
      return;
    }

    const fetchLabOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://3.6.230.54:4003/api/apiLabCPOEList.sh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            UserName: 'CPRS-UAT',
            Password: 'UAT@123',
            PatientSSN: patient.ssn, // Use direct SSN access
            DUZ: '115',
            ihtLocation: 102,
            FromDate: '',
            ToDate: '',
            Action: 'L'
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Transform the API response to match our interface
        const orders = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          section: value.Section || 'UNKNOWN',
          labTest: value['Lab Test'] || 'N/A',
          sample: value.Sample || 'N/A',
          orderDate: value['Order Date'] || '',
          orderTime: value['Order Time'] || '',
          startDate: value['Start Date'] || '',
          startTime: value['Start Time'] || '',
          status: value.Status || 'UNKNOWN',
        }));

        setLabOrders(orders);
      } catch (err) {
        console.error('Error fetching lab orders:', err);
        setError('Failed to load lab orders');
      } finally {
        setLoading(false);
      }
    };

    fetchLabOrders();
  }, [patient.ssn]);

  const filteredLabOrders = labOrders.filter(order => {
    const matchesSection = sectionFilter ? order.section.toLowerCase() === sectionFilter.toLowerCase() : true;
    const matchesSearch = searchTerm ? Object.values(order).some((value) => (value as any)?.toString().toLowerCase().includes(searchTerm.toLowerCase())) : true;
    return matchesSection && matchesSearch;
  });

  const totalPages = Math.ceil(filteredLabOrders.length / parseInt(showEntries));
  const startIndex = (currentPage - 1) * parseInt(showEntries);
  const endIndex = startIndex + parseInt(showEntries);
  const paginatedLabOrders = filteredLabOrders.slice(startIndex, endIndex);

  const labCpoeTableHeaders = ["Section", "Lab Test", "Sample", "Order Date", "Order Time", "Start Date", "Start Time", "Status"];

  return (
    <Card className="flex-1 flex flex-col shadow overflow-hidden">
      <CardHeader className="p-2.5 border-b bg-card text-foreground rounded-t-md">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Lab CPOE List</CardTitle>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-muted/50">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-muted/50">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2.5 flex-1 flex flex-col overflow-hidden">
        <div className="space-y-2 mb-2 text-xs">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Label htmlFor="labSection" className="shrink-0">Section</Label>
            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger id="labSection" className="h-7 w-24 text-xs">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                {Array.from(new Set(labOrders.map(order => order.section))).map(section => (
                  <SelectItem key={`section-${section}`} value={section}>{section}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label htmlFor="labSearch" className="shrink-0">Search:</Label>
            <Input id="labSearch" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="h-7 w-40 text-xs" />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="flex items-center space-x-1">
              <Label htmlFor="labShowEntries" className="text-xs shrink-0">Show</Label>
              <Select value={showEntries} onValueChange={setShowEntries}>
                <SelectTrigger id="labShowEntries" className="h-7 w-16 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <Label htmlFor="labShowEntries" className="text-xs shrink-0">entries</Label>
            </div>
            <div className="flex-grow"></div>
          </div>
        </div>

        <div className="flex-1 overflow-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading lab orders...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-destructive">{error}</p>
            </div>
          ) : (
            <Table className="text-xs w-full">
              <TableHeader className="bg-accent sticky top-0 z-10">
                <TableRow>
                  {labCpoeTableHeaders.map(header => (
                    <TableHead key={header} className="py-1 px-3 text-xs h-auto">
                      <div className="flex items-center justify-between">
                        {header}
                        <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground hover:text-foreground cursor-pointer" />
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLabOrders.length > 0 ? paginatedLabOrders.map((lab, index) => (
                  <TableRow key={`lab-${lab.id}`} className={`${index % 2 === 0 ? 'bg-muted/30' : ''}`}>
                    <TableCell className="py-1 px-3">{lab.section}</TableCell>
                    <TableCell className="py-1 px-3">{lab.labTest}</TableCell>
                    <TableCell className="py-1 px-3">{lab.sample}</TableCell>
                    <TableCell className="py-1 px-3">{lab.orderDate}</TableCell>
                    <TableCell className="py-1 px-3">{lab.orderTime}</TableCell>
                    <TableCell className="py-1 px-3">{lab.startDate}</TableCell>
                    <TableCell className="py-1 px-3">{lab.startTime}</TableCell>
                    <TableCell className="py-1 px-3 text-xs">{lab.status}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={labCpoeTableHeaders.length} className="text-center py-10 text-muted-foreground">
                      No lab orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="flex items-center justify-between p-2.5 border-t text-xs text-muted-foreground mt-auto">
          <div>Showing {paginatedLabOrders.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredLabOrders.length)} of {filteredLabOrders.length} entries</div>
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1 bg-accent text-foreground border-border">{currentPage}</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Visit/ADT View
const VisitAdtView = ({ patient }: { patient: Patient }) => {
  const [visitDate, setVisitDate] = useState<string | undefined>("Select");
  const [visitDetails, setVisitDetails] = useState<VisitData[]>([]);
  const [loadingLabOrders, setLoadingLabOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('VisitAdtView - Patient data:', patient); // Debug log

  useEffect(() => {
    console.log('VisitAdtView - useEffect triggered with patient:', patient);
    
    setLoadingLabOrders(true);
    setError(null);

    if (!patient?.ssn) {
      setError('Patient SSN not available.');
      setLoadingLabOrders(false);
      return;
    }

    const requestBody = {
      UserName: "CPRS-UAT",
      Password: "UAT@123",
      PatientSSN: patient.ssn,
      DUZ: "115"
    };

    console.log('Fetching visit details for SSN:', patient.ssn);
    
    console.log('API URL:', 'http://3.6.230.54:4003/api/apiPatVstDtl.sh');
    
    console.log('Sending request with body:', JSON.stringify(requestBody, null, 2));
    
    fetch('http://3.6.230.54:4003/api/apiPatVstDtl.sh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody),
    })
      .then(async res => {
        console.log('Response status:', res.status);
        if (!res.ok) {
          const errorText = await res.text();
          console.error('API Error:', errorText);
          throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
        }
        return res.json();
      })
      .then((data: Record<string, VisitData>) => {
        console.log('Visit Details API response:', data);
        if (!data || Object.keys(data).length === 0 || data.errors) {
          setVisitDetails([]);
          setError('No data found');
        } else {
          const detailsArray = Object.values(data);
          setVisitDetails(detailsArray);
          // Set the first non-select visit date as default
          const firstValidVisit = detailsArray.find((visit: VisitData) => visit.VST_DATE !== "Select");
          if (firstValidVisit) {
            setVisitDate(firstValidVisit.VST_DATE);
          }
        }
      })
      .catch(err => {
        console.error('Error fetching visit details:', err);
        setError('Failed to fetch visit details: ' + err.message);
      })
      .finally(() => setLoadingLabOrders(false));

  }, [patient]); // Depend on patient to refetch if it changes

  const visitAdtTableHeaders = ["Visit Date", "Visit Type", "Hospital", "Visit IEN", "Visit DFT"];

  return (
    <Card className="flex-1 flex flex-col shadow overflow-hidden">
      <CardHeader className="p-2.5 border-b bg-card text-foreground rounded-t-md">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Visit/ADT Details</CardTitle>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-muted/50">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-muted/50">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2.5 flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs mb-2">
          <Label htmlFor="visitDate" className="shrink-0 text-xs">Visit Date</Label>
          <Select 
            value={visitDate} 
            onValueChange={setVisitDate}
          >
            <SelectTrigger id="visitDate" className="h-7 w-40 text-xs">
              <SelectValue placeholder="Select Visit Date" />
            </SelectTrigger>
            <SelectContent>
              {visitDetails.map((visit) => (
                <SelectItem 
                  key={String(visit.VST_IEN)} 
                  value={String(visit.VST_DATE)} 
                  className="text-xs"
                >
                  {String(visit.VST_DATE)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-auto min-h-0">
          {loadingLabOrders ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading visit details...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-destructive">{error}</p>
            </div>
          ) : (
            <Table className="text-xs w-full">
              <TableHeader className="bg-accent sticky top-0 z-10">
                <TableRow>
                  {visitAdtTableHeaders.map(header => (
                    <TableHead key={header} className="py-1 px-3 text-xs h-auto">
                      <div className="flex items-center justify-between">
                        {header}
                        <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground hover:text-foreground cursor-pointer" />
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitDetails.length > 0 ? visitDetails.map((visit, index) => (
                  <TableRow 
                    key={visit.VST_IEN ? String(visit.VST_IEN) : `visit-row-${index}`} 
                    className={`${index % 2 === 0 ? 'bg-muted/30' : ''}`}
                  >
                    <TableCell className="py-1 px-3">{String(visit.VST_DATE)}</TableCell>
                    <TableCell className="py-1 px-3">{String(visit.VST_TYP)}</TableCell>
                    <TableCell className="py-1 px-3">{String(visit.VST_HOS)}</TableCell>
                    <TableCell className="py-1 px-3">{String(visit.VST_IEN)}</TableCell>
                    <TableCell className="py-1 px-3">{String(visit.VST_DFT)}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={visitAdtTableHeaders.length} className="text-center py-10 text-muted-foreground">
                      No visit details found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ProcedureOrderView = () => (
  <Card className="flex-1 flex items-center justify-center">
    <CardContent className="text-center">
      <p className="text-muted-foreground">Procedure Order View</p>
    </CardContent>
  </Card>
);

const NursingCareView = () => (
  <Card className="flex-1 flex items-center justify-center">
    <CardContent className="text-center">
      <p className="text-muted-foreground">Nursing Care View</p>
    </CardContent>
  </Card>
);

// Add interface for API response type
interface ApiPatientResponse {
  DFN: number;
  Name: string;
  Gender: string;
  Age: number | string;
  DOB: string;
  Ward: string;
  Bed: string;
  "Admission Date": string;
  LOS: string;
  "Mobile No": number;
  "Primary Consultant": string;
  "Secondary Consultant": string;
  Specialty: string;
  "Treating Consultant": string;
  posting: string;
  ssn: string;
  "IP No": number;
}

// Main Orders Page
const OrdersPage: NextPage<OrdersPageProps> = ({ patient: initialPatient }) => {
  const [activeSubNav, setActiveSubNav] = useState<string>(orderSubNavItems[0]);
  const [patient, setPatient] = useState<Patient | null>(initialPatient || null);
  const [loadingLabOrders, setLoadingLabOrders] = useState(!initialPatient);

  useEffect(() => {
    const fetchDefaultPatient = async () => {
      if (!initialPatient) {
        try {
          setLoadingLabOrders(true);
          console.log('Fetching default patient data with default SSN...');
          // Fetch default patient using the default SSN
          const defaultSSN = "670768354";
          const data = await apiService.getPatients(defaultSSN) as ApiPatientResponse[];
          console.log('Default Patient API response:', data);

          if (data && data.length > 0) {
            // Map API data to Patient type from constants.ts
            const defaultPatientData = data[0]; // Get the first patient from the results
            const defaultPatient: Patient = {
              id: String(defaultPatientData.DFN || ''),
              name: defaultPatientData.Name || '',
              avatarUrl: '',
              gender: defaultPatientData.Gender || '',
              age: typeof defaultPatientData.Age === 'number' ? defaultPatientData.Age : parseInt(String(defaultPatientData.Age)) || 0,
              dob: defaultPatientData.DOB || '',
              wardNo: defaultPatientData.Ward || '',
              bedDetails: defaultPatientData.Bed || '',
              admissionDate: defaultPatientData["Admission Date"] || '',
              lengthOfStay: defaultPatientData.LOS || '',
              mobile: String(defaultPatientData["Mobile No"] || ''),
              primaryConsultant: defaultPatientData["Primary Consultant"] || '',
              "Secondary Consultant": defaultPatientData["Secondary Consultant"] || '',
              specialty: defaultPatientData.Specialty || '',
              encounterProvider: defaultPatientData["Treating Consultant"] || '',
              finalDiagnosis: '',
              posting: defaultPatientData.posting || '',
              reasonForVisit: '',
              ssn: String(defaultPatientData.ssn || ''),
              "Admission Date": defaultPatientData["Admission Date"] || '',
              Age: defaultPatientData.Age,
              Bed: defaultPatientData.Bed || '',
              DFN: defaultPatientData.DFN || 0,
              DOB: defaultPatientData.DOB || '',
              Gender: defaultPatientData.Gender || '',
              "IP No": defaultPatientData["IP No"] || 0,
              LOS: defaultPatientData.LOS || '',
              "Mobile No": defaultPatientData["Mobile No"] || 0,
              Name: defaultPatientData.Name || '',
              "Primary Consultant": defaultPatientData["Primary Consultant"] || '',
              Specialty: defaultPatientData.Specialty || '',
              "Treating Consultant": defaultPatientData["Treating Consultant"] || '',
              Ward: defaultPatientData.Ward || '',
            };
            console.log('Mapped patient data:', defaultPatient);
            setPatient(defaultPatient);
          } else {
            console.log('No default patient data found for SSN', defaultSSN);
            setPatient(null);
          }
        } catch (error) {
          console.error('Error fetching default patient:', error);
          setPatient(null);
        } finally {
          setLoadingLabOrders(false);
        }
      } else {
        console.log('Using initial patient data:', initialPatient);
        setPatient(initialPatient);
      }
    };

    fetchDefaultPatient();
  }, [initialPatient]);

  if (loadingLabOrders) {
    return (
      <div className="flex flex-col h-[calc(100vh-var(--top-nav-height,40px))] bg-background text-sm p-3">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col h-[calc(100vh-var(--top-nav-height,40px))] bg-background text-sm p-3">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Unable to load patient data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-var(--top-nav-height,40px))] bg-background text-sm px-2.5 pb-4 pt-0">
      {/* Horizontal Sub-Navigation Bar */}
      <div className="flex items-end space-x-1 px-1 pb-0 overflow-x-auto no-scrollbar">
        {orderSubNavItems.map((item) => (
          <Button
            key={item} // Add key prop here
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
      <main className="flex-1 flex flex-col pt-0 pb-2.5 overflow-hidden">
        {activeSubNav === "CPOE Order List" && <CpoeOrderListView patient={patient} />}
        {activeSubNav === "Write Delay Order" && <DelayOrdersView />}
        {activeSubNav === "IP Medication" && <IpMedicationView patient={patient} />}
        {activeSubNav === "Laboratory" && <LabCpoeListView patient={patient} />}
        {activeSubNav === "Radiology" && <RadiologyView patient={patient} />}
        {activeSubNav === "Visit/ADT" && <VisitAdtView patient={patient} />}
        {activeSubNav === "Procedure Order" && <ProcedureOrderView />}
        {activeSubNav === "Nursing Care" && <NursingCareView />}
      </main>
    </div>
  );
};

export default OrdersPage;
