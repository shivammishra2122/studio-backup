"use client";

import * as React from "react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { api, Patient } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PatientSearch } from "@/components/patient/patient-search";
import { 
  User, 
  Calendar, 
  Clock, 
  Home, 
  Bed, 
  Stethoscope, 
  UserCog, 
  CreditCard, 
  FileText, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

type SortDirection = 'asc' | 'desc';

const TABLE_FIELDS = [
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
] as const;

type TableFieldKey = typeof TABLE_FIELDS[number]['key'];

function getStringValue(val: any): string {
  if (val === undefined || val === null) return '';
  return String(val).toLowerCase();
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchOption, setSearchOption] = useState("Appointment's");
  const [sortKey, setSortKey] = useState<TableFieldKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const { toast } = useToast();
  const router = useRouter();

  const handleSearch = useCallback(() => {
    console.log('Search triggered with:', { search, searchOption });
  }, [search, searchOption]);

  const handleSearchOptionChange = useCallback((option: string) => {
    setSearchOption(option);
    setSearch(""); // Reset search when changing search option
  }, []);

  const handleSort = useCallback((key: TableFieldKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }, [sortKey, sortDir]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getPatients();
        if (Array.isArray(data)) {
          setPatients(data as Patient[]);
        } else {
          setError('Invalid data format received from server');
          setPatients([]);
        }
      } catch (error) {
        setError('Failed to fetch patients. Please try again.');
        setPatients([]);
        toast({
          title: "Error",
          description: "Failed to fetch patients. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [toast]);

  const filteredPatients = useMemo(() => {
    let filtered = [...patients];
    
    // Apply search filter
    if (search.trim() !== "") {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(patient => 
        Object.values(patient).some(val => 
          String(val).toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply sorting
    if (sortKey) {
      filtered.sort((a, b) => {
        const aVal = getStringValue(a[sortKey as keyof Patient]);
        const bVal = getStringValue(b[sortKey as keyof Patient]);
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [patients, search, sortKey, sortDir]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading patients...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Patient List</h1>
            <Button onClick={() => window.location.reload()} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Try Again
            </Button>
          </div>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-2 md:p-4 lg:p-4">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Header */}
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-[#2d3748]">Patient List</h1>
          <p className="text-xs text-gray-600">
            {filteredPatients.length} {filteredPatients.length === 1 ? 'patient' : 'patients'} found
            {search && ` matching "${search}"`}
          </p>
        </div>
        
        {/* Patient Search Section */}
        <PatientSearch
          search={search}
          onSearchChange={setSearch}
          onSearchOptionChange={handleSearchOptionChange}
          onSearch={handleSearch}
        />
        
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
                        className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer bg-[#2c5282] group"
                        onClick={() => handleSort(field.key)}
                      >
                        <div className="flex items-center">
                          <Icon className="h-4 w-4 mr-1.5 text-blue-300 group-hover:text-white" />
                          <span className="flex items-center">
                            {field.label}
                            {sortKey === field.key && (
                              sortDir === 'asc' ? (
                                <ChevronUp className="ml-1 h-4 w-4 text-white" />
                              ) : (
                                <ChevronDown className="ml-1 h-4 w-4 text-white" />
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
                {filteredPatients.map((patient, index) => (
                  <tr 
                    key={patient.id || index}
                    className="bg-blue-50 cursor-pointer border-b border-blue-100 h-8"
                    onClick={() => patient.id && router.push(`/patients/${patient.id}`)}
                  >
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    {TABLE_FIELDS.map(field => (
                      <td 
                        key={`${patient.id}-${field.key}`}
                        className={`px-2 py-1 text-xs whitespace-nowrap ${
                          field.key === 'Name' ? 'font-medium text-[#2b6cb0]' : 'text-gray-700'
                        } ${field.key === 'DFN' ? 'font-mono' : ''}`}
                      >
                        {patient[field.key as keyof Patient] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan={TABLE_FIELDS.length + 1} className="px-6 py-4 text-center text-sm text-gray-500">
                      No patients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}