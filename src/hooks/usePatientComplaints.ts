import { useState, useCallback, useEffect } from 'react';

interface Complaint {
  CmpType: string;
  CompName: string;
  DateTime: string;
  FLEDID: string;
  "Order IEN": string;
  Remark: string;
  Status: string;
}

export function usePatientComplaints(patientSSN: string) {
  const [complaints, setComplaints] = useState<Record<string, Complaint>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://3.6.230.54:4003/api/apiComplaintsList.sh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UserName: "CPRS-UAT",
          Password: "UAT@123",
          PatientSSN: patientSSN,
          DUZ: "115",
          ihtLocation: 102,
          rcpAdmDateL: ""
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setComplaints(data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch complaints'));
    } finally {
      setLoading(false);
    }
  }, [patientSSN]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  return { complaints, loading, error, refresh: fetchComplaints };
}