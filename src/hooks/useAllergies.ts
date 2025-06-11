import { useState, useEffect } from 'react';

interface Allergy {
  allergen: string;
  reaction: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  dateOnset: string;
  treatment: string;
  status: 'Active' | 'Inactive';
}

export function useAllergies(patientId: string) {
  const [data, setData] = useState<Allergy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`http://3.6.230.54:4003/api/apiAllergyList.sh?patientId=${patientId}`);
        if (!response.ok) throw new Error('Failed to fetch allergies');
        const result = await response.json();
        setData(result.allergies || []);
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