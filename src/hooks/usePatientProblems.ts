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

export function usePatientProblems(patientSSN: string): UsePatientProblemsResult {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProblems = async () => {
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
    };

    fetchProblems();
  }, [patientSSN]);

  return { problems, loading, error };
}

export default usePatientProblems;
