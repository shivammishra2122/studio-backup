'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchProcedureOrders, type ProcedureOrder } from '@/services/procedure';
import { Loader2, AlertCircle, ExternalLink, Calendar, MapPin, User, ClipboardList } from 'lucide-react';

const nursingSubNavItems = ["Nurse Order", "Nurse Chart List", "Pharmacy"];

const nurseOrderOptions = [
  "POC Test",
  "Nursing Procedure Order",
  "Homecare Service Request",
  "Nursing Care"
];

const NursingPage = () => {
  const [activeSubNav, setActiveSubNav] = useState<string>(nursingSubNavItems[0]);
  const [procedureOrders, setProcedureOrders] = useState<ProcedureOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Nurse Order button click handler
  const handleNurseOrderClick = (option: string) => {
    console.log(`Selected: ${option}`);
    // Add your navigation or action logic here
  };

  useEffect(() => {
    if (activeSubNav === 'Nurse Order') {
      let isMounted = true;
      
      const fetchData = async () => {
        try {
          console.log('Starting to fetch procedure orders...');
          setLoading(true);
          setError(null);
          
          const data = await fetchProcedureOrders('670768354'); // Using default SSN from the API
          
          if (isMounted) {
            console.log('Successfully fetched procedure orders:', data);
            setProcedureOrders(data);
          }
        } catch (err) {
          console.error('Failed to fetch procedure orders:', err);
          if (isMounted) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load procedure orders';
            setError(`Error: ${errorMessage}. Please check the console for more details.`);
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

      fetchData();
      
      return () => {
        isMounted = false;
      };
    } else {
      // Reset state when switching tabs
      setProcedureOrders([]);
      setError(null);
    }
  }, [activeSubNav]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      'COMPLETE': { bg: 'bg-green-100', text: 'text-green-800', label: 'Complete' },
      'ACTIVE': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Active' },
      'DISCONTINUED': { bg: 'bg-red-100', text: 'text-red-800', label: 'Discontinued' },
    };
    
    const statusInfo = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-var(--top-nav-height,60px))] bg-background text-sm p-2">
      {/* Navigation Tabs */}
      <div className="flex items-end space-x-1 px-1 pb-0 overflow-x-auto no-scrollbar">
        {nursingSubNavItems.map((item) => (
          <Button
            key={item}
            variant={activeSubNav === item ? "default" : "ghost"}
            size="sm"
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-3 overflow-hidden">
        {activeSubNav === 'Nurse Order' && (
          <Card className="flex-1 flex flex-col shadow-sm">
            <CardHeader className="px-4 py-2 border-b">
              <CardTitle className="text-base font-medium">Nurse Order</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4 gap-3">
              {nurseOrderOptions.map((option) => (
                <Button
                  key={option}
                  variant="outline"
                  className="justify-start h-14 text-left text-sm px-4 py-3 rounded-lg border-gray-200 hover:bg-gray-50"
                  onClick={() => handleNurseOrderClick(option)}
                >
                  {option}
                </Button>
              ))}
            </CardContent>
          </Card>
        )}

        {activeSubNav === 'Nurse Chart List' && (
          <Card className="flex-1 flex flex-col shadow-sm">
            <CardHeader className="px-4 py-3 border-b">
              <CardTitle className="text-base font-medium">Nurse Chart List</CardTitle>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-2">
                <div className="flex items-center gap-2 text-sm">
                  <span>Show</span>
                  <select className="border rounded px-2 py-1 text-sm">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                    <option>100</option>
                  </select>
                  <span>entries</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative">
                    <select className="border rounded px-3 py-1.5 text-sm pr-8 w-full sm:w-48">
                      <option value="">Speciality</option>
                      <option>Cardiology</option>
                      <option>Neurology</option>
                      <option>Pediatrics</option>
                    </select>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="border rounded px-3 py-1.5 text-sm w-full sm:w-48"
                    />
                    <svg
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-auto">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        S No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Entered
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Speciality
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entered By
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[1, 2, 3, 4, 5].map((item, index) => (
                      <tr key={item} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          05/07/2023 10:30 AM
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Cardiology
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Main Hospital
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Dr. Smith
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of{' '}
                      <span className="font-medium">25</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <a
                        href="#"
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Previous</span>
                        &larr;
                      </a>
                      <a
                        href="#"
                        aria-current="page"
                        className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                      >
                        1
                      </a>
                      <a
                        href="#"
                        className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                      >
                        2
                      </a>
                      <a
                        href="#"
                        className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                      >
                        3
                      </a>
                      <a
                        href="#"
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Next</span>
                        &rarr;
                      </a>
                    </nav>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSubNav === 'Pharmacy' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
            {/* Indent Card */}
            <Card className="shadow-sm">
              <CardHeader className="bg-gray-50 px-4 py-3 border-b">
                <CardTitle className="text-base font-medium">Indent</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12 text-left text-sm px-4 py-3 rounded-lg border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  Nursing Indent
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12 text-left text-sm px-4 py-3 rounded-lg border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  Change Medication Order
                </Button>
              </CardContent>
            </Card>

            {/* Drug Request Card */}
            <Card className="shadow-sm">
              <CardHeader className="bg-gray-50 px-4 py-3 border-b">
                <CardTitle className="text-base font-medium">Drug Request</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12 text-left text-sm px-4 py-3 rounded-lg border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  Indent Request
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12 text-left text-sm px-4 py-3 rounded-lg border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  Indent Search
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12 text-left text-sm px-4 py-3 rounded-lg border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  Bulk Approval
                </Button>
              </CardContent>
            </Card>


            {/* Drug Administration Card */}
            <Card className="shadow-sm">
              <CardHeader className="bg-gray-50 px-4 py-3 border-b">
                <CardTitle className="text-base font-medium">Drug Administration</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12 text-left text-sm px-4 py-3 rounded-lg border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  Distribute Drug
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12 text-left text-sm px-4 py-3 rounded-lg border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  Make Ward Stock Garbage
                </Button>
              </CardContent>
            </Card>

            {/* Pharmacy Report Card */}
            <Card className="shadow-sm">
              <CardHeader className="bg-gray-50 px-4 py-3 border-b">
                <CardTitle className="text-base font-medium">Pharmacy Report</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12 text-left text-sm px-4 py-3 rounded-lg border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  Ward Stock Report
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12 text-left text-sm px-4 py-3 rounded-lg border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  Distribute Report
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12 text-left text-sm px-4 py-3 rounded-lg border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  Ward Garbage Report
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12 text-left text-sm px-4 py-3 rounded-lg border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  MIS Report
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default NursingPage;