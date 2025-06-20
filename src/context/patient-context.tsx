'use client';

import * as React from 'react';
import { Patient } from '@/services/api';
import { apiService } from '@/services/api';

const { createContext, useContext, useState, useCallback } = React;
type ReactNode = React.ReactNode;

interface PatientContextType {
  patients: Patient[];
  currentPatient: Patient | null;
  loading: boolean;
  error: string | null;
  fetchPatients: (searchParams?: Record<string, any>) => Promise<void>;
  setCurrentPatient: (patient: Patient | null) => void;
  clearError: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider = ({ children }: { children: ReactNode }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async (searchParams: Record<string, any> = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Get patients data with search params
      const data = await apiService.getPatients(searchParams) as unknown as Patient[];
      setPatients(Array.isArray(data) ? data : []);
      
      // If we have a current patient, update it
      if (currentPatient) {
        const updatedPatient = data?.find(p => p.ssn === currentPatient.ssn);
        if (updatedPatient) {
          setCurrentPatient(updatedPatient);
        }
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to fetch patients. Please try again.');
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPatient]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    patients,
    currentPatient,
    loading,
    error,
    fetchPatients,
    setCurrentPatient,
    clearError,
  };

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatients = () => {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
};

export default PatientContext;
