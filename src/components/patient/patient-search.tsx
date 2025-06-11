'use client';

import * as React from 'react';
import { Search, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { usePatientActions } from '@/hooks/use-patient-actions';

type SearchOption = 'name' | 'ssn' | 'ipno';

interface PatientSearchProps {
  onSearchComplete?: () => void;
  className?: string;
}

export function PatientSearch({
  onSearchComplete,
  className,
}: PatientSearchProps) {
  const [searchOption, setSearchOption] = React.useState<SearchOption>('name');
  const [searchValue, setSearchValue] = React.useState('');
  const [fromDate, setFromDate] = React.useState<Date | undefined>();
  const [toDate, setToDate] = React.useState<Date | undefined>();
  const [clinic, setClinic] = React.useState('');
  const { searchPatients } = usePatientActions();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const searchParams: Record<string, any> = {
      searchType: searchOption,
      searchValue,
    };

    if (fromDate) searchParams.fromDate = format(fromDate, 'yyyy-MM-dd');
    if (toDate) searchParams.toDate = format(toDate, 'yyyy-MM-dd');
    if (clinic) searchParams.clinic = clinic;

    await searchPatients(searchParams);
    onSearchComplete?.();
  };

  const handleSearchOptionChange = (value: string) => {
    setSearchOption(value as SearchOption);
    setSearchValue(''); // Reset search when changing options
  };

  return (
    <div className={cn('space-y-4', className)}>
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <RadioGroup 
            value={searchOption}
            onValueChange={handleSearchOptionChange}
            className="flex flex-wrap gap-3 text-xs items-center"
            name="searchType"
          >
            <div className="flex items-center space-x-1.5">
              <RadioGroupItem value="name" id="name" className="h-3.5 w-3.5" />
              <Label htmlFor="name" className="text-xs whitespace-nowrap cursor-pointer">
                Name
              </Label>
            </div>
            <div className="flex items-center space-x-1.5">
              <RadioGroupItem value="ssn" id="ssn" className="h-3.5 w-3.5" />
              <Label htmlFor="ssn" className="text-xs whitespace-nowrap cursor-pointer">
                SSN
              </Label>
            </div>
            <div className="flex items-center space-x-1.5">
              <RadioGroupItem value="ipno" id="ipno" className="h-3.5 w-3.5" />
              <Label htmlFor="ipno" className="text-xs whitespace-nowrap cursor-pointer">
                IP No
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="clinic" className="text-xs text-gray-600">Clinic</Label>
            <select
              id="clinic"
              className="w-full rounded border border-gray-300 text-xs h-8 px-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={clinic}
              onChange={(e) => setClinic(e.target.value)}
            >
              <option value="">All Clinics</option>
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
                  type="button"
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
                  type="button"
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
            <Label htmlFor="search" className="text-xs text-gray-600">
              Search by {searchOption === 'name' ? 'Name' : searchOption.toUpperCase()}
            </Label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                id="search"
                type="search"
                placeholder={`Enter ${searchOption === 'name' ? 'name' : searchOption}...`}
                className="w-full pl-8 h-8 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            size="sm" 
            className="h-8 text-xs"
            disabled={!searchValue}
          >
            <Search className="mr-1 h-3.5 w-3.5" />
            Search
          </Button>
        </div>
      </form>
    </div>
  );
}
