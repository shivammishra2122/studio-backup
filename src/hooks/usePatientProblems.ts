// src/hooks/usePatientProblems.ts
import { useState, useEffect, useCallback } from 'react';
import { problemService, Problem as ApiProblem, ProblemSearchParams } from '@/services/api';

export interface Problem {
  id: string;
  problem: string;
  dateOfOnset: string;
  status: string;
  immediacy: string;
  orderIen: number;
  editUrl: string;
  removeUrl: string;
  viewUrl: string;
}

interface UsePatientProblemsResult {
  problems: Problem[];
  loading: boolean;
  error: Error | null;
  searchProblems: (searchTerm: string) => Promise<void>;
  searchResults: ApiProblem[];
  isSearching: boolean;
  searchError: Error | null;
}

export function usePatientProblems(patientSSN: string): UsePatientProblemsResult {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchResults, setSearchResults] = useState<ApiProblem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<Error | null>(null);

  // Fetch patient's existing problems
  const fetchProblems = useCallback(async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://3.6.230.54:4003';
      const response = await fetch(`${baseUrl}/api/apiProbList.sh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UserName: 'CPRS-UAT',
          Password: 'UAT@123',
          PatientSSN: patientSSN,
          DUZ: '115',
          ihtLocation: '102',
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json() as Record<string, any>;

      const parsed: Problem[] = Object.values(data || {}).map((item: any, idx: number) => ({
        id: String(item['Order IEN'] ?? idx),
        problem: item['Problems'] ?? '',
        dateOfOnset: item['Date of OnSet'] ?? '',
        status: item['Status'] ?? '',
        immediacy: item['Immediacy Description'] ?? '',
        orderIen: item['Order IEN'] ?? 0,
        editUrl: item['Edit'] ?? '#',
        removeUrl: item['Remove'] ?? '#',
        viewUrl: item['URL'] ?? '#',
      }));

      setProblems(parsed);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch problems'));
      setProblems([]);
    } finally {
      setLoading(false);
    }
  }, [patientSSN]);

  // Search for problems
  const searchProblems = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      setSearchError(null);
      
      const params: ProblemSearchParams = {
        UserName: 'CPRS-UAT',
        Password: 'UAT@123',
        PatientSSN: patientSSN,
        DUZ: '115',
        cdpProbCat: '',
        other: searchTerm
      };

      const results = await problemService.searchProblems(params);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching problems:', err);
      setSearchError(err instanceof Error ? err : new Error('Failed to search problems'));
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [patientSSN]);

  // Initial data fetch
  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  return { 
    problems, 
    loading, 
    error, 
    searchProblems, 
    searchResults, 
    isSearching, 
    searchError 
  };
}

export default usePatientProblems;