"use client";

import { useState, useEffect, useRef } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { problemService, Problem } from '@/services/api';

interface ProblemSearchProps {
  value: string;
  onChange: (value: string) => void;
  patientSSN: string;
  className?: string;
}

export function ProblemSearch({ value, onChange, patientSSN, className }: ProblemSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();

  // Fetch problems based on search query
  useEffect(() => {
    if (searchQuery.trim().length < 1) {
      setProblems([]);
      return;
    }

    setLoading(true);
    
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set a new timeout to debounce the API call
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await problemService.searchProblems({
          UserName: 'CPRS-UAT',
          Password: 'UAT@123',
          PatientSSN: patientSSN,
          DUZ: '20407',
          cdpProbCat: '',
          other: searchQuery
        });
        
        // Transform the API response to match our Problem interface if needed
        const formattedResults = results.map((item: any) => ({
          id: item.id || '',
          problem: item.problem || '',
          dateOfOnset: item.dateOfOnset || '',
          status: item.status || '',
          immediacy: item.immediacy || '',
          orderIen: item.orderIen || 0,
          editUrl: item.editUrl || '',
          removeUrl: item.removeUrl || '',
          viewUrl: item.viewUrl || '',
        }));
        
        setProblems(formattedResults);
      } catch (error) {
        console.error('Error fetching problems:', error);
        setProblems([]);
      } finally {
        setLoading(false);
      }
    }, 500); // Increased debounce time to 500ms

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery, patientSSN]);

  // Update selected problem when value changes
  useEffect(() => {
    if (value && problems.length > 0) {
      const problem = problems.find(p => p.id === value);
      if (problem) {
        setSelectedProblem(problem);
      }
    } else {
      setSelectedProblem(null);
    }
  }, [value, problems]);

  const handleSelect = (problemId: string) => {
    onChange(problemId);
    const problem = problems.find(p => p.id === problemId);
    if (problem) {
      setSelectedProblem(problem);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-9 text-sm", className)}
        >
          {selectedProblem ? selectedProblem.problem : "Search problems..."}
          {loading ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search problems..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-9"
          />
          <CommandList>
            {loading ? (
              <div className="py-6 text-center text-sm">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                <p className="mt-2">Searching problems...</p>
              </div>
            ) : (
              <>
                <CommandEmpty className="py-6 text-center text-sm">
                  {searchQuery ? 'No problems found' : 'Type to search for problems'}
                </CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-y-auto">
                  {problems.map((problem) => (
                    <CommandItem
                      key={problem.id}
                      value={problem.id}
                      onSelect={() => handleSelect(problem.id)}
                      className="text-sm cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === problem.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {problem.problem}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
