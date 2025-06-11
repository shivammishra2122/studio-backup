"use client";

import * as React from "react";
import { useMemo, useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Calendar as CalendarIcon,
  Calendar,
  Clock, 
  Home, 
  Bed, 
  Stethoscope, 
  UserCog, 
  CreditCard, 
  FileText,
  ChevronDown, 
  ChevronUp,
  Loader2,
  AlertTriangle,
  RefreshCw as RefreshCwIcon,
  Search as SearchIcon
 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePatients } from "@/context/patient-context";
import { usePatientActions } from "@/hooks/use-patient-actions";
import { format } from "date-fns";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type SortDirection = 'asc' | 'desc';

type TableFieldKey = 'DFN' | 'Name' | 'Age' | 'Admission Date' | 'LOS' | 'Ward' | 'Bed' | 'Specialty' | 'Primary Consultant' | 'Payer Category' | 'Type of Admission' | 'MLC';

interface TableField {
  key: TableFieldKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABLE_FIELDS: TableField[] = [
  { key: 'DFN', label: 'Patient ID', icon: FileText },
  { key: 'Name', label: 'Patient Name', icon: User },
  { key: 'Age', label: 'Age/Gender', icon: UserCog },
  { key: 'Admission Date', label: 'Admission', icon: Calendar },
  { key: 'LOS', label: 'LOS', icon: Clock },
  { key: 'Ward', label: 'Ward', icon: Home },
  { key: 'Bed', label: 'Bed', icon: Bed },
  { key: 'Specialty', label: 'Specialty', icon: Stethoscope },
  { key: 'Primary Consultant', label: 'Consultant', icon: UserCog },
  { key: 'Payer Category', label: 'Payer', icon: CreditCard },
  { key: 'Type of Admission', label: 'Admission Type', icon: FileText },
  { key: 'MLC', label: 'MLC', icon: AlertTriangle },
];

function getStringValue(val: any): string {
  if (val == null) return '-';
  return String(val);
}

export default function PatientsPage() {
  const { patients, loading, error, fetchPatients } = usePatients();
  const [sortKey, setSortKey] = useState<TableFieldKey>('Name');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const router = useRouter();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('Default');

  // Advanced search dialog state
  const [isAdvOpen, setIsAdvOpen] = useState(false);
  const [advName, setAdvName] = useState('');
  const [advDob, setAdvDob] = useState('');
  const [advPhone, setAdvPhone] = useState('');
  const [advIp, setAdvIp] = useState('');

  // Fetch patients on initial load
  useEffect(() => {
    const loadPatients = async () => {
      try {
        await fetchPatients({});
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Failed to load patients:', err);
      }
    };

    loadPatients();
  }, [fetchPatients]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await fetchPatients({});
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to refresh patients:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAdvancedSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, any> = {};
    if (advName) params.name = advName;
    if (advDob) params.dob = advDob;
    if (advPhone) params.phone = advPhone;
    if (advIp) params.ipno = advIp;
    await fetchPatients(params);
    setIsAdvOpen(false);
  };

  const handleSort = useCallback((key: TableFieldKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }, [sortKey]);

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients;
    
    const query = searchQuery.toLowerCase();
    return patients.filter(patient => 
      Object.values(patient).some(
        val => val && String(val).toLowerCase().includes(query)
      )
    );
  }, [patients, searchQuery]);

  const sortedPatients = useMemo(() => {
    if (!sortKey) return filteredPatients;

    return [...filteredPatients].sort((a, b) => {
      // Use type assertion to access dynamic properties
      const aValue = (a as any)[sortKey] || '';
      const bValue = (b as any)[sortKey] || '';
      
      if (aValue < bValue) return sortDir === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredPatients, sortKey, sortDir]);

  const handleRowClick = useCallback((e: React.MouseEvent, patient: any) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a, button')) {
      return;
    }
    if (patient.DFN) {
      router.push(`/patients/${patient.DFN}`);
    }
  }, [router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Patients</h2>
        <p className="text-gray-600 mb-6">Failed to load patient data. Please try again.</p>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCwIcon className="h-4 w-4" />
          )}
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#2d3748]">Patient List</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 text-xs h-8"
          >
            {isRefreshing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCwIcon className="h-3.5 w-3.5" />
            )}
            Refresh
          </Button>
        </div>
        <p className="text-xs text-gray-600">
          {filteredPatients.length} {filteredPatients.length === 1 ? 'patient' : 'patients'} found
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>
      
      {/* Category section (left) + Search section (right) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <RadioGroup
          value={filterCategory}
          onValueChange={setFilterCategory}
          className="flex flex-wrap gap-x-12 gap-y-2 text-sm md:flex-1"
        >
          {['Appointments', "Ward's", "Provider's", 'Emergency', "Team/Personal's", 'Specialties', 'Default', 'New Order Dashboard'].map((cat) => (
            <div key={cat} className="flex items-center space-x-1.5">
              <RadioGroupItem value={cat} id={cat} className="h-3.5 w-3.5" />
              <Label htmlFor={cat} className="text-xs whitespace-nowrap cursor-pointer">
                {cat}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {/* Client-side search filter */}
        <div className="relative max-w-md md:max-w-xs md:flex-shrink-0">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Filter patients..."
            className="pl-9 h-9 text-sm border rounded-md w-full px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Search Buttons */}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="default" onClick={() => setSearchQuery(searchQuery)} className="h-8 text-xs">Search</Button>

          <Dialog open={isAdvOpen} onOpenChange={setIsAdvOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 text-xs">Advanced</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Advanced Patient Search</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdvancedSearch} className="space-y-3 mt-2">
                <div className="space-y-1">
                  <Label htmlFor="adv-name">Name</Label>
                  <Input id="adv-name" value={advName} onChange={(e) => setAdvName(e.target.value)} placeholder="Last Name, First Name" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="adv-dob">Date of Birth</Label>
                  <Input id="adv-dob" value={advDob} onChange={(e) => setAdvDob(e.target.value)} placeholder="DD/MM/YYYY" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="adv-phone">Phone No.</Label>
                  <Input id="adv-phone" value={advPhone} onChange={(e) => setAdvPhone(e.target.value)} placeholder="Phone Number" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="adv-ip">IP No.</Label>
                  <Input id="adv-ip" value={advIp} onChange={(e) => setAdvIp(e.target.value)} placeholder="IP Number" />
                </div>
                <DialogFooter className="mt-4">
                  <Button type="submit" size="sm">Search</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
        
        {/* Patient Table */}
      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider bg-[#2c5282]">
                  #
                </th>
                {TABLE_FIELDS.map((field) => {
                  const Icon = field.icon;
                  return (
                    <th
                      key={field.key}
                      scope="col"
                      className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider bg-[#2c5282]"
                      onClick={() => handleSort(field.key)}
                    >
                      <div className="flex items-center">
                        <Icon className="h-4 w-4 mr-1.5 text-blue-300" />
                        <span className="flex items-center">
                          {field.label}
                          {sortKey === field.key && (
                            sortDir === 'asc' ? (
                              <ChevronUp className="ml-1 h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="ml-1 h-3.5 w-3.5" />
                            )
                          )}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && !isRefreshing ? (
                <tr>
                  <td colSpan={TABLE_FIELDS.length + 1} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      <p className="text-sm text-gray-500">Loading patients...</p>
                    </div>
                  </td>
                </tr>
              ) : sortedPatients.length === 0 ? (
                <tr>
                  <td colSpan={TABLE_FIELDS.length + 1} className="px-6 py-12 text-center">
                    <p className="text-sm text-gray-500">
                      {searchQuery ? 'No patients match your search. Try a different term.' : 'No patients found.'}
                    </p>
                  </td>
                </tr>
              ) : (
                sortedPatients.map((patient, index) => (
                  <tr 
                    key={patient.DFN || index} 
                    className="bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                    onClick={(e) => handleRowClick(e, patient)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    {TABLE_FIELDS.map(field => (
                      <td 
                        key={`${patient.DFN}-${field.key}`} 
                        className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
                      >
                        {getStringValue(patient[field.key as keyof typeof patient])}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <p>Showing {sortedPatients.length} of {patients.length} patients</p>
        <p>Last updated: {lastUpdated.toLocaleString()}</p>
      </div>
    </div>
  );
}