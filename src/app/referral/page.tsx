'use client';

import type { NextPage } from 'next';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Patient } from '@/services/api';

const referralSubNavItems = ["Consult Order", "Procedure Order", "Physiotherapy"] as const;
type ReferralSubNav = typeof referralSubNavItems[number];

// Mock data for consult orders
const consultOrders = [
  {
    id: 1,
    orderName: 'Consultation - Cardiology',
    provider: 'Dr. Smith',
    status: 'Active',
    requestDate: '2023-06-15',
    location: 'Cardiology OPD',
    sign: 'Dr. Johnson',
    discontinued: false
  },
  {
    id: 2,
    orderName: 'ECG Test',
    provider: 'Dr. Williams',
    status: 'Completed',
    requestDate: '2023-06-14',
    location: 'Cardiology Diagnostic',
    sign: 'Dr. Johnson',
    discontinued: false
  },
  {
    id: 3,
    orderName: 'Echocardiogram',
    provider: 'Dr. Brown',
    status: 'Pending',
    requestDate: '2023-06-16',
    location: 'Cardiology Diagnostic',
    sign: '',
    discontinued: false
  },
];

// Mock data for procedure orders
const procedureOrders = [
  {
    id: 1,
    orderName: 'X-Ray - Chest PA View',
    provider: 'Dr. Anderson',
    status: 'Active',
    requestDate: '2023-06-15',
    location: 'Radiology',
    sign: 'Dr. Johnson',
    discontinued: false
  },
  {
    id: 2,
    orderName: 'MRI - Brain',
    provider: 'Dr. Williams',
    status: 'Completed',
    requestDate: '2023-06-14',
    location: 'Radiology',
    sign: 'Dr. Johnson',
    discontinued: false
  },
  {
    id: 3,
    orderName: 'Ultrasound - Abdomen',
    provider: 'Dr. Brown',
    status: 'Pending',
    requestDate: '2023-06-16',
    location: 'Radiology',
    sign: '',
    discontinued: false
  },
];

// Mock data for physiotherapy
const physiotherapyData = [
  {
    id: 1,
    consultName: 'Physiotherapy - General',
    patientId: 'PT-1001',
    patientName: 'John Doe',
    requestDate: '2023-06-15',
    therapyStartDate: '2023-06-16',
    therapyEndDate: '2023-07-16',
    status: 'Active',
    attention: 'Dr. Smith'
  },
  {
    id: 2,
    consultName: 'Post-Op Rehab',
    patientId: 'PT-1002',
    patientName: 'Jane Smith',
    requestDate: '2023-06-14',
    therapyStartDate: '2023-06-15',
    therapyEndDate: '2023-07-15',
    status: 'Active',
    attention: 'Dr. Johnson'
  },
  {
    id: 3,
    consultName: 'Sports Injury',
    patientId: 'PT-1003',
    patientName: 'Mike Johnson',
    requestDate: '2023-06-16',
    therapyStartDate: '2023-06-17',
    therapyEndDate: '2023-07-17',
    status: 'Pending',
    attention: 'Dr. Williams'
  },
];

const statusOptions = ["All", "Active", "Pending", "Completed", "Discontinued"];

const ReferralPage: NextPage<{ patient?: Patient }> = ({ patient }) => {
  const [activeSubNav, setActiveSubNav] = useState<ReferralSubNav>("Consult Order");
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date());
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [status, setStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [physioStatus, setPhysioStatus] = useState("All");
  const [physioFromDate, setPhysioFromDate] = useState<Date | undefined>();
  const [physioToDate, setPhysioToDate] = useState<Date | undefined>();
  const [physioSearchQuery, setPhysioSearchQuery] = useState("");
  const [physioCurrentPage, setPhysioCurrentPage] = useState(1);
  const physioItemsPerPage = 10;

  // Filter orders based on search and status
  const filteredOrders = consultOrders.filter(order => {
    const matchesSearch = order.orderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       order.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = status === "All" || order.status === status;
    return matchesSearch && matchesStatus;
  });

  const filteredProcedureOrders = procedureOrders.filter(order => {
    const matchesSearch = order.orderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       order.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = status === "All" || order.status === status;
    return matchesSearch && matchesStatus;
  });

  // Filter physiotherapy data
  const filteredPhysioData = physiotherapyData.filter(item => {
    const matchesSearch = item.consultName.toLowerCase().includes(physioSearchQuery.toLowerCase()) ||
                       item.patientName.toLowerCase().includes(physioSearchQuery.toLowerCase()) ||
                       item.patientId.toLowerCase().includes(physioSearchQuery.toLowerCase());
    const matchesStatus = physioStatus === "All" || item.status === physioStatus;
  
    // Date filtering
    const requestDate = new Date(item.requestDate);
    const fromDateMatch = !physioFromDate || requestDate >= new Date(physioFromDate.setHours(0, 0, 0, 0));
    const toDateMatch = !physioToDate || requestDate <= new Date(physioToDate.setHours(23, 59, 59, 999));
  
    return matchesSearch && matchesStatus && fromDateMatch && toDateMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPagesProcedure = Math.ceil(filteredProcedureOrders.length / itemsPerPage);
  const paginatedProcedureOrders = filteredProcedureOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Pagination for physiotherapy
  const totalPhysioPages = Math.ceil(filteredPhysioData.length / physioItemsPerPage);
  const paginatedPhysioData = filteredPhysioData.slice(
    (physioCurrentPage - 1) * physioItemsPerPage,
    physioCurrentPage * physioItemsPerPage
  );

  return (
    <div className="flex flex-col h-[calc(100vh-var(--top-nav-height,60px))] bg-background text-sm p-2">
      {/* Navigation Tabs */}
      <div className="flex items-end space-x-1 px-1 pb-0 overflow-x-auto no-scrollbar">
        {referralSubNavItems.map((item) => (
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
        {activeSubNav === 'Consult Order' && (
          <div className="flex flex-col h-full">
            {/* Filters */}
            <Card className="shadow-sm mb-2">
              <CardHeader className="px-4 py-2 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Consult Order List</CardTitle>
                  <Filter className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Visit Date</Label>
                    <div className="relative">
                      <Input
                        type="date"
                        className="h-8 text-xs"
                        value={fromDate ? format(fromDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setFromDate(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status} className="text-xs">
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Order From Date</Label>
                    <div className="relative">
                      <Input
                        type="date"
                        className="h-8 text-xs"
                        value={fromDate ? format(fromDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setFromDate(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Order To Date</Label>
                    <div className="relative">
                      <Input
                        type="date"
                        className="h-8 text-xs"
                        value={toDate ? format(toDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setToDate(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search..."
                        className="h-8 pl-8 text-xs"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders Table */}
            <Card className="flex-1 flex flex-col shadow-sm overflow-hidden">
              <div className="flex-1 overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Consult Order List
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Provider
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request Date
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sign
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discontinue
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes View
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order View
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                            {order.orderName}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                            {order.provider}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === 'Active' ? 'bg-green-100 text-green-800' :
                              order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                            {order.requestDate}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                            {order.location}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                            {order.sign || '-'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <Button
                              variant={order.discontinued ? "outline" : "default"}
                              size="xs"
                              className="h-6 text-xs"
                            >
                              {order.discontinued ? 'Discontinued' : 'Discontinue'}
                            </Button>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <span className="text-xs">+</span>
                            </Button>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <span className="text-xs">👁️</span>
                            </Button>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <span className="text-xs">📄</span>
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} className="px-3 py-4 text-center text-xs text-gray-500">
                          No consult orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <CardFooter className="px-4 py-2 border-t bg-gray-50 flex items-center justify-between">
                <div className="text-xs text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredOrders.length}</span> of{' '}
                  <span className="font-medium">{filteredOrders.length}</span> results
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={currentPage === 1}>
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center justify-center h-8 w-8 text-xs">
                    {currentPage}
                  </div>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={currentPage === totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={currentPage === totalPages}>
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}

        {activeSubNav === 'Procedure Order' && (
          <div className="flex flex-col h-full">
            {/* Filters */}
            <Card className="shadow-sm mb-2">
              <CardHeader className="px-4 py-2 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Procedure Order List</CardTitle>
                  <Filter className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Visit Date</Label>
                    <div className="relative">
                      <Input
                        type="date"
                        className="h-8 text-xs"
                        value={fromDate ? format(fromDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setFromDate(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status} className="text-xs">
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Order From Date</Label>
                    <div className="relative">
                      <Input
                        type="date"
                        className="h-8 text-xs"
                        value={fromDate ? format(fromDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setFromDate(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Order To Date</Label>
                    <div className="relative">
                      <Input
                        type="date"
                        className="h-8 text-xs"
                        value={toDate ? format(toDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setToDate(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search..."
                        className="h-8 pl-8 text-xs"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Procedure Orders Table */}
            <Card className="flex-1 flex flex-col shadow-sm overflow-hidden">
              <div className="flex-1 overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Procedure Order List
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Provider
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request Date
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sign
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discontinue
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes View
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order View
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProcedureOrders.length > 0 ? (
                      filteredProcedureOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                            {order.orderName}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                            {order.provider}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === 'Active' ? 'bg-gray-100 text-gray-800' :
                              order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                            {order.requestDate}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                            {order.location}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                            {order.sign || '-'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <Button
                              variant="ghost"
                              size="xs"
                              className="h-6 text-xs"
                            >
                              {order.discontinued ? 'Discontinued' : 'Discontinue'}
                            </Button>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <span className="text-xs">+</span>
                            </Button>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <span className="text-xs">👁️</span>
                            </Button>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <span className="text-xs">📄</span>
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} className="px-3 py-4 text-center text-xs text-gray-500">
                          No procedure orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <CardFooter className="px-4 py-2 border-t bg-gray-50 flex items-center justify-between">
                <div className="text-xs text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredProcedureOrders.length}</span> of{' '}
                  <span className="font-medium">{filteredProcedureOrders.length}</span> results
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={currentPage === 1}>
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center justify-center h-8 w-8 text-xs">
                    {currentPage}
                  </div>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={currentPage === totalPagesProcedure}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={currentPage === totalPagesProcedure}>
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}

        {activeSubNav === 'Physiotherapy' && (
          <div className="flex flex-col h-full">
            {/* Filters */}
            <Card className="shadow-sm mb-2">
              <CardHeader className="px-4 py-2 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Physiotherapy</CardTitle>
                  <Filter className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Status</Label>
                    <Select value={physioStatus} onValueChange={setPhysioStatus}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All" className="text-xs">All</SelectItem>
                        <SelectItem value="Active" className="text-xs">Active</SelectItem>
                        <SelectItem value="Pending" className="text-xs">Pending</SelectItem>
                        <SelectItem value="Completed" className="text-xs">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">From Date</Label>
                    <div className="relative">
                      <Input
                        type="date"
                        className="h-8 text-xs"
                        value={physioFromDate ? format(physioFromDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setPhysioFromDate(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">To Date</Label>
                    <div className="relative">
                      <Input
                        type="date"
                        className="h-8 text-xs"
                        value={physioToDate ? format(physioToDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setPhysioToDate(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search..."
                        className="h-8 pl-8 text-xs"
                        value={physioSearchQuery}
                        onChange={(e) => setPhysioSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Physiotherapy Table */}
            <Card className="flex-1 flex flex-col shadow-sm overflow-hidden">
              <div className="flex-1 overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        S No.
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Consult Name
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient ID
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient Name
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request Date
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Therapy Start Date
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Therapy End Date
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attention
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPhysioData.length > 0 ? (
                      paginatedPhysioData.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                            {index + 1 + (physioCurrentPage - 1) * physioItemsPerPage}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                            {item.consultName}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                            {item.patientId}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                            {item.patientName}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                            {item.requestDate}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                            {item.therapyStartDate}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                            {item.therapyEndDate}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                            {item.attention}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-3 py-4 text-center text-xs text-gray-500">
                          No physiotherapy records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <CardFooter className="px-4 py-2 border-t bg-gray-50 flex items-center justify-between">
                <div className="text-xs text-gray-700">
                  Showing <span className="font-medium">
                    {filteredPhysioData.length > 0 ? (physioCurrentPage - 1) * physioItemsPerPage + 1 : 0}
                  </span> to <span className="font-medium">
                    {Math.min(physioCurrentPage * physioItemsPerPage, filteredPhysioData.length)}
                  </span> of{' '}
                  <span className="font-medium">{filteredPhysioData.length}</span> results
                </div>
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={() => setPhysioCurrentPage(1)}
                    disabled={physioCurrentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={() => setPhysioCurrentPage(p => Math.max(1, p - 1))}
                    disabled={physioCurrentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center justify-center h-8 w-8 text-xs">
                    {physioCurrentPage}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={() => setPhysioCurrentPage(p => Math.min(totalPhysioPages, p + 1))}
                    disabled={physioCurrentPage === totalPhysioPages || totalPhysioPages === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={() => setPhysioCurrentPage(totalPhysioPages)}
                    disabled={physioCurrentPage === totalPhysioPages || totalPhysioPages === 0}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReferralPage;
