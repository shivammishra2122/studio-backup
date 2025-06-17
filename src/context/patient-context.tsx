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

  const fetchPatients = useCallback(async (searchParams?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      // Convert searchParams object to query string
      const queryString = searchParams ? new URLSearchParams(searchParams).toString() : '';
      
      // Cast the response to Patient[] since we know the shape of our API response
      const data = await apiService.getPatients(queryString) as unknown as Patient[];
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch patients. Please try again.');
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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
