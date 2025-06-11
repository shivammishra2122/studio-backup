import { useState, useEffect } from 'react';

interface Problem {
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
}

export function usePatientProblems(patientId: string): UsePatientProblemsResult {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/patients/${patientId}/problems`);
        // const data = await response.json();
        
        // Mock data for now
        const mockProblems: Problem[] = [
          {
            id: '1',
            problem: 'Hypertension (I10)',
            dateOfOnset: '2024-01-15',
            status: 'A',
            immediacy: 'Chronic',
            orderIen: 12345,
            editUrl: '#',
            removeUrl: '#',
            viewUrl: '#'
          },
          // Add more mock problems as needed
        ];
        
        setProblems(mockProblems);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch problems'));
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [patientId]);

  return { problems, loading, error };
}

export default usePatientProblems;
