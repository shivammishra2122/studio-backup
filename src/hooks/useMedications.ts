import { useState, useEffect } from 'react';

interface Medication {
  name: string;
  reason: string;
  amount: string;
  timing: string;
}

export function useMedications(patientId: string) {
  const [data, setData] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`http://3.6.230.54:4003/api/apiOrdMedList.sh?patientId=${patientId}`);
        if (!response.ok) throw new Error('Failed to fetch medications');
        const result = await response.json();
        setData(result.medications || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    if (patientId) fetchData();
  }, [patientId]);

  return { data, loading, error };
}