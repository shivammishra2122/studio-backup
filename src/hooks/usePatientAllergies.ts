import { useState, useEffect, useCallback } from 'react';

export interface Allergy {
  Allergies: string;
  Cancel: string;
  Date: string;
  "Nature of Reaction": string;
  "Observed/Historical": string;
  "Order IEN": number;
  Originator: string;
  Symptoms: string;
  View: string;
}

export interface UsePatientAllergiesResult {
  allergies: Record<string, Allergy>;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function usePatientAllergies(patientSSN: string): UsePatientAllergiesResult {
  const [allergies, setAllergies] = useState<Record<string, Allergy>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAllergies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://3.6.230.54:4003/api/apiAllergyList.sh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          UserName: 'CPRS-UAT',
          Password: 'UAT@123',
          PatientSSN: patientSSN,
          DUZ: '115',
          ihtLocation: '102'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Allergies API Response:', data);
      setAllergies(data);
    } catch (err) {
      console.error('Error fetching allergies:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch allergies'));
    } finally {
      setLoading(false);
    }
  }, [patientSSN]);

  useEffect(() => {
    fetchAllergies();
  }, [fetchAllergies]);

  return { allergies, loading, error, refresh: fetchAllergies };
}
