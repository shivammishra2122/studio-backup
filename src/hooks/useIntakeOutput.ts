// src/hooks/useIntakeOutput.ts
import { useState, useEffect } from 'react';
import { fetchIntakeOutputData, IntakeOutputSummary } from '@/services/intakeOutput';

export const useIntakeOutput = (patientSSN: string) => {
  const [data, setData] = useState<IntakeOutputSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchIntakeOutputData(patientSSN);
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load intake/output data'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [patientSSN]);

  return { data, loading, error };
};