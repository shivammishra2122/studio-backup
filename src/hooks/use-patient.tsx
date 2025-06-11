import React, { createContext, useContext } from 'react';
import { Patient } from '@/services/api';

// Context type
interface PatientContextType {
    patient: Patient | null;
}

// Create context
const PatientContext = createContext<PatientContextType>({ patient: null });

// Provider
export const PatientProvider = ({ patient, children }: { patient: Patient | null; children: React.ReactNode }) => (
    <PatientContext.Provider value={{ patient }}>{children}</PatientContext.Provider>
);

// Hook
export const usePatient = () => {
    const context = useContext(PatientContext);
    if (context === undefined) {
        throw new Error('usePatient must be used within a PatientProvider');
    }
    return context.patient;
}; 