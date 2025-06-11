
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="flex flex-col h-[calc(100vh-var(--top-nav-height,60px))] bg-background text-sm px-3 pb-3 pt-0">
      {/* Horizontal Navigation Bar */}
      <div className="flex items-end space-x-1 px-1 pb-0 overflow-x-auto no-scrollbar">
        {nursingSubNavItems.map((item) => (
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

      {/* Right Content Panel */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeSubNav === "Nurse Order" && (
          <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="bg-[#f8f9fa] px-6 py-3 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Procedure Orders</h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <ClipboardList className="h-4 w-4 mr-1.5" />
                  New Order
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
              {loading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                  <span className="text-sm text-muted-foreground">Loading procedure orders...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center p-12 text-destructive">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>{error}</span>
                </div>
              ) : (
                <div className="min-w-full">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-[120px] text-xs font-medium text-gray-500 uppercase tracking-wider">Order</TableHead>
                        <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">Details</TableHead>
                        <TableHead className="w-[120px] text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Status</TableHead>
                        <TableHead className="w-[120px] text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-200">
                      {procedureOrders.length > 0 ? (
                        procedureOrders.map((order) => (
                          <TableRow key={order.id} className="hover:bg-gray-50">
                            <TableCell className="py-3">
                              <div className="text-sm font-medium text-gray-900">#{order.orderId}</div>
                              <div className="text-xs text-gray-500">{order.service}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-medium text-gray-900">{order.order}</div>
                              <div className="mt-1 flex flex-col space-y-1 text-xs text-gray-500">
                                <div className="flex items-center">
                                  <User className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                  <span>{order.provider}</span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                  <span>{order.location}</span>
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                  <span>{order.startDate}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {getStatusBadge(order.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-gray-500 hover:text-primary"
                                  title="View Order"
                                  asChild
                                >
                                  <a href={order.viewUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="px-6 py-8 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <ClipboardList className="h-8 w-8 mb-2 text-gray-400" />
                              <p className="text-sm font-medium">No procedure orders found</p>
                              <p className="text-xs mt-1">Create a new order to get started</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
            
            {procedureOrders.length > 0 && (
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button variant="outline" size="sm" className="relative">
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="ml-3">
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">1</span> to <span className="font-medium">{procedureOrders.length}</span> of{' '}
                      <span className="font-medium">{procedureOrders.length}</span> results
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" disabled={true}>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled={true}>
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSubNav === "Nurse Chart List" && (
          <Card className="flex-1 flex items-center justify-center shadow-sm">
            <CardContent className="text-center">
              <CardTitle className="text-xl text-muted-foreground">
                Nurse Chart List
              </CardTitle>
              <p className="text-sm text-muted-foreground">Content for this section is not yet implemented.</p>
            </CardContent>
          </Card>
        )}

        {activeSubNav === "Pharmacy" && (
          <Card className="flex-1 flex items-center justify-center shadow-sm">
            <CardContent className="text-center">
              <CardTitle className="text-xl text-muted-foreground">
                Pharmacy
              </CardTitle>
              <p className="text-sm text-muted-foreground">Content for this section is not yet implemented.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default NursingPage;
