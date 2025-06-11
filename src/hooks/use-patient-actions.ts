import { useCallback } from 'react';
import { usePatients } from '@/context/patient-context';
import { api } from '@/services/api';

interface PatientSearchParams {
  searchType?: string;
  searchValue?: string;
  fromDate?: string;
  toDate?: string;
  // Add other search parameters as needed
}

export const usePatientActions = () => {
  const { 
    fetchPatients, 
    setCurrentPatient, 
    clearError 
  } = usePatients();

  const searchPatients = useCallback(async (params: PatientSearchParams = {}) => {
    try {
      // Map frontend params to API expected params
      const apiParams: Record<string, any> = {};
      
      if (params.searchType && params.searchValue) {
        if (params.searchType === 'ssn') {
          apiParams.PatientSSN = params.searchValue;
        } else if (params.searchType === 'name') {
          apiParams.lname = params.searchValue;
        } else if (params.searchType === 'ipno') {
          apiParams.cpIPNo = params.searchValue;
        }
      }

      if (params.fromDate) apiParams.fromDate = params.fromDate;
      if (params.toDate) apiParams.toDate = params.toDate;

      await fetchPatients(apiParams);
      return true;
    } catch (error) {
      console.error('Error searching patients:', error);
      return false;
    }
  }, [fetchPatients]);

  const getPatientDetails = useCallback(async (patientId: string) => {
    try {
      // If you have a specific endpoint for patient details, use it here
      // const patient = await api.getPatientDetails(patientId);
      // setCurrentPatient(patient);
      // return patient;
      
      // For now, we'll just find the patient in the existing list
      // This should be replaced with an actual API call in production
      return null;
    } catch (error) {
      console.error('Error fetching patient details:', error);
      return null;
    }
  }, [setCurrentPatient]);

  const clearCurrentPatient = useCallback(() => {
    setCurrentPatient(null);
  }, [setCurrentPatient]);

  return {
    searchPatients,
    getPatientDetails,
    clearCurrentPatient,
    clearError,
  };
};
