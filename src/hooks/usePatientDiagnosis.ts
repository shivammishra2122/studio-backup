import { useState, useEffect } from 'react';

export interface Diagnosis {
  Add: string;
  Comment: string;
  "Diagnosis Description": string;
  DigArrValue: string;
  "Entered Date": string;
  "Order IEN": number;
  Primary: string;
  Provider: string;
  Remove: string;
  Type: string;
}

interface UsePatientDiagnosisResult {
  diagnosis: Record<string, Diagnosis>;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function usePatientDiagnosis(patientSSN: string): UsePatientDiagnosisResult {
  const [diagnosis, setDiagnosis] = useState<Record<string, Diagnosis>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDiagnosis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://3.6.230.54:4003/api/apiDiagList.sh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "UserName": "CPRS-UAT",
          "Password": "UAT@123",
          "PatientSSN": patientSSN,
          "DUZ": "115",
          "ihtLocation": "102",
          "rcpAdmDateL": "11084766"
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Diagnosis API Response:', data);
      setDiagnosis(data);
    } catch (err) {
      console.error('Error fetching diagnosis data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch diagnosis data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnosis();
  }, [patientSSN]);

  return {
    diagnosis,
    loading,
    error,
    refresh: fetchDiagnosis
  };
}

export default usePatientDiagnosis;
