import { Patient } from '@/lib/constants';

/**
 * Safely extracts the SSN from a Patient object
 * @param patient The patient object which may contain SSN in different formats
 * @returns The patient's SSN or an empty string if not available
 */
export const getPatientSSN = (patient?: Patient | null): string => {
  if (!patient) return '';
  
  // First try the direct ssn field
  if (patient.ssn) return patient.ssn;
  
  // Try alternative SSN fields that might be present in the API response
  if ('SSN' in patient && patient.SSN) return String(patient.SSN);
  if ('SSN No' in patient && patient['SSN No']) return String(patient['SSN No']);
  
  // If we have a DFN (patient ID), we can use that as a fallback
  if ('DFN' in patient && patient.DFN) return String(patient.DFN);
  
  return '';
};

// Re-export any other patient-related utilities here
export * from './patientUtils';
