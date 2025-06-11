'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileSearch2, Pencil, Copy, Trash2, Flag, Eye, Plus, Search } from 'lucide-react';
import type { Patient } from '@/services/api';
import { fetchRadiologyOrders, type RadiologyEntry } from '@/services/radiology';

const radiologySubNavItems = ["Radiology Test", "Pending Results", "Archived Scans"];

interface RadiologyPageProps {
  patient: Patient;
}

export default function RadiologyPage({ patient }: RadiologyPageProps) {
  console.log('RadiologyPage rendered with patient:', patient);
  const [activeSubNav, setActiveSubNav] = useState<string>(radiologySubNavItems[0]);
  const [isLoading, setIsLoading] = useState(false);
  console.log('Current loading state:', isLoading);
  const [error, setError] = useState<string | null>(null);
  const [radiologyData, setRadiologyData] = useState<RadiologyEntry[]>([]);
  const [filteredData, setFilteredData] = useState<RadiologyEntry[]>([]);
  const [searchText, setSearchText] = useState<string>("");

  // Fetch radiology data on component mount
  useEffect(() => {
    const loadRadiologyData = async () => {
      // Always use the default SSN for now
      const defaultSSN = '671209686';
      console.log('Using default SSN for radiology data:', defaultSSN);
      
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching radiology orders with SSN:', defaultSSN);
        const data = await fetchRadiologyOrders(defaultSSN);
        
        if (data && data.length > 0) {
          console.log('Successfully fetched radiology data:', data);
          setRadiologyData(data);
          setFilteredData(data);
        } else {
          console.log('No radiology data found');
          setError('No radiology orders found for this patient');
          setRadiologyData([]);
          setFilteredData([]);
        }
      } catch (err) {
        console.error('Error fetching radiology data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load radiology data';
        setError(`Error: ${errorMessage}`);
        setRadiologyData([]);
        setFilteredData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRadiologyData();
  }, []); // Empty dependency array since we're using a fixed SSN

  // Filter entries based on search text
  useEffect(() => {
    const filteredData = radiologyData.filter(entry =>
      entry.imagingProcedure.toLowerCase().includes(searchText.toLowerCase()) ||
      entry.imagingType.toLowerCase().includes(searchText.toLowerCase()) ||
      entry.provider.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredData(filteredData);
  }, [searchText, radiologyData]);

  return (
    <div className="flex flex-col h-screen bg-white text-sm w-full overflow-hidden">
      {/* Header */}
      <div className="bg-[#1a365d] px-6 py-3 flex-shrink-0">
        <div className="max-w-[2000px] mx-auto">
          <h2 className="text-lg font-semibold text-white break-words">Radiology Orders</h2>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Input
              placeholder="Search orders..."
              className="w-64 h-9 text-sm pl-9 pr-3 py-1.5 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <Select>
            <SelectTrigger className="h-9 w-36 text-sm">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="unreleased">Unreleased</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="h-9 text-sm bg-[#3182ce] hover:bg-[#2c5282] text-white">
          <Plus className="h-4 w-4 mr-1.5" /> New Order
        </Button>
      </div>

      {/* Main Table */}
      <div className="flex-1 overflow-auto p-0 w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-gray-200 m-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#3182ce] mb-3" />
            <p className="text-gray-600">Loading radiology orders...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="h-full flex items-center justify-center bg-white rounded-lg border border-gray-200">
            <div className="text-center p-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No radiology orders</h3>
              <p className="mt-1 text-sm text-gray-500">No radiology orders found for this patient.</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col bg-white overflow-auto w-full">
            <div className="min-w-max w-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#1a365d]">
                  <tr>
                    <th scope="col" className="px-1 py-2 text-center text-xs font-medium text-white uppercase tracking-wider w-[40px] min-w-[40px]">
                      <div className="break-words">S.NO</div>
                    </th>
                    <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider w-[300px] min-w-[200px]">
                      <div className="break-words">IMAGING PROCEDURE</div>
                    </th>
                    <th scope="col" className="px-1 py-2 text-left text-xs font-medium text-white uppercase tracking-wider w-[100px] min-w-[80px]">
                      <div className="break-words">TYPE</div>
                    </th>
                    <th scope="col" className="px-1 py-2 text-left text-xs font-medium text-white uppercase tracking-wider w-[140px] min-w-[120px]">
                      <div className="break-words">EXAM DATE/TIME</div>
                    </th>
                    <th scope="col" className="px-1 py-2 text-left text-xs font-medium text-white uppercase tracking-wider w-[100px] min-w-[80px]">
                      <div className="break-words">STATUS</div>
                    </th>
                    <th scope="col" className="px-1 py-2 text-left text-xs font-medium text-white uppercase tracking-wider w-[180px] min-w-[150px]">
                      <div className="break-words">PROVIDER</div>
                    </th>
                    <th scope="col" className="px-1 py-2 text-center text-xs font-medium text-white uppercase tracking-wider w-[60px] min-w-[60px]">
                      <div className="break-words">VIEW</div>
                    </th>
                    <th scope="col" className="px-1 py-2 text-center text-xs font-medium text-white uppercase tracking-wider w-[60px] min-w-[60px]">
                      <div className="break-words">SIGN</div>
                    </th>
                    <th scope="col" className="px-1 py-2 text-center text-xs font-medium text-white uppercase tracking-wider w-[80px] min-w-[80px]">
                      <div className="break-words">CHANGE</div>
                    </th>

                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item, index) => (
                    <tr key={item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-50/80`}>
                      <td className="px-1 py-2 text-center text-sm text-gray-900 w-[40px] min-w-[40px]">
                        {index + 1}
                      </td>
                      <td className="px-2 py-2 text-sm font-medium text-gray-900 w-[300px] min-w-[200px]">
                        <div className="line-clamp-2">{item.imagingProcedure}</div>
                      </td>
                      <td className="px-1 py-2 text-sm text-gray-600 w-[100px] min-w-[80px]">
                        <div className="truncate">{item.imagingType}</div>
                      </td>
                      <td className="px-1 py-2 text-sm text-gray-600 w-[140px] min-w-[120px] whitespace-nowrap">
                        {item.orderDateTime}
                      </td>
                      <td className="px-1 py-2 w-[100px] min-w-[80px]">
                        <div className="flex items-center">
                          <span 
                            className={`px-1.5 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full whitespace-nowrap ${
                              item.status === 'COMPLETE' 
                                ? 'bg-green-100 text-green-800' 
                                : item.status === 'UNRELEASED'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-1 py-2 text-sm text-gray-600 w-[180px] min-w-[150px]">
                        <div className="line-clamp-2">{item.provider}</div>
                      </td>
                      <td className="px-1 py-2 w-[60px] min-w-[60px]">
                        <div className="flex justify-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 text-gray-500 hover:text-[#3182ce] hover:bg-blue-50 rounded-md"
                            title="View"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-1 py-2 w-[60px] min-w-[60px]">
                        <div className="flex justify-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 text-gray-500 hover:text-[#3182ce] hover:bg-blue-50 rounded-md"
                            title="Sign"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-1 py-2 w-[80px] min-w-[80px]">
                        <div className="flex justify-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 text-gray-500 hover:text-[#3182ce] hover:bg-blue-50 rounded-md"
                            title="Change"
                          >
                            <FileSearch2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}