'use client';

import * as React from 'react';
import { Search, Calendar as CalendarIcon, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';

type SearchOption = 
  | "Appointment's"
  | "Emergency"
  | "New Order Dashboard"
  | "Ward's"
  | "Team/Personal's"
  | "Provider's"
  | "Specialties"
  | "Default";

interface PatientSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearchOptionChange: (option: SearchOption) => void;
  onSearch: () => void;
  className?: string;
}

export function PatientSearch({
  search,
  onSearchChange,
  onSearchOptionChange,
  onSearch,
  className,
}: PatientSearchProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [searchOption, setSearchOption] = React.useState<SearchOption>("Appointment's");
  const [fromDate, setFromDate] = React.useState<Date | undefined>(new Date());
  const [toDate, setToDate] = React.useState<Date | undefined>(new Date());
  const [clinic, setClinic] = React.useState<string>('');

  const handleSearchOptionChange = (value: string) => {
    const option = value as SearchOption;
    setSearchOption(option);
    onSearchOptionChange(option);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
        <RadioGroup 
          value={searchOption}
          onValueChange={handleSearchOptionChange}
          className="flex flex-wrap gap-3 text-xs items-center"
        >
          {["Appointment's", "Emergency", "New Order Dashboard", "Ward's", "Team/Personal's", "Provider's", "Specialties", "Default"].map((option) => (
            <div key={option} className="flex items-center space-x-1.5">
              <RadioGroupItem 
                value={option} 
                id={option} 
                className="h-3.5 w-3.5"
              />
              <Label htmlFor={option} className="text-xs whitespace-nowrap cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3 items-end">
        <div className="flex flex-col space-y-1">
          <Label htmlFor="clinic" className="text-xs text-gray-600">Clinic</Label>
          <select
            id="clinic"
            className="w-full rounded border border-gray-300 text-xs h-8 px-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            value={clinic}
            onChange={(e) => setClinic(e.target.value)}
          >
            <option value="">Select Clinic</option>
            <option value="clinic1">Clinic 1</option>
            <option value="clinic2">Clinic 2</option>
          </select>
        </div>
        
        <div className="flex flex-col space-y-1">
          <Label htmlFor="from-date" className="text-xs text-gray-600">From</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-8 text-xs border-gray-300 hover:bg-gray-50",
                  !fromDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                {fromDate ? format(fromDate, "MMM dd, yyyy") : <span>Select date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={setFromDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col space-y-1">
          <Label htmlFor="to-date" className="text-xs text-gray-600">To</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-8 text-xs border-gray-300 hover:bg-gray-50",
                  !toDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                {toDate ? format(toDate, "MMM dd, yyyy") : <span>Select date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={toDate}
                onSelect={setToDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col space-y-1">
          <Label className="text-xs text-gray-600">Search</Label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-8 h-8 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
