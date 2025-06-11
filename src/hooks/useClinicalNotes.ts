import { useState, useEffect } from 'react';

interface ClinicalNote {
  title: string;
}

export function useClinicalNotes(patientId: string) {
  const [data, setData] = useState<ClinicalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`http://3.6.230.54:4003/api/apiCLNoteList.sh?patientId=${patientId}`);
        if (!response.ok) throw new Error('Failed to fetch clinical notes');
        const result = await response.json();
        setData(result.notes || []);
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