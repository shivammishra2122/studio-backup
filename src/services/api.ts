import axios from 'axios';
import { getSession } from '@/lib/auth-utils';

// Base URLs
export const AUTH_BASE_URL = 'http://192.168.1.53/cgi-bin';
export const API_BASE_URL = 'http://192.168.1.53/cgi-bin';

// Helper function to get auth params
const getAuthParams = () => {
  const session = getSession();
  if (!session) {
    throw new Error('User not authenticated');
  }
  return {
    UserName: session.userName,
    Password: session.password,
    DUZ: session.duz,
    htLocation: session.htLocation
  };
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${AUTH_BASE_URL}/apiLogin.sh`,
  LOCATIONS: `${AUTH_BASE_URL}/apiLogLoc.sh`,
  
  // Patient Data
  PATIENTS: `${API_BASE_URL}/apiPatDetail.sh`,
  CLINICAL_NOTES: `${API_BASE_URL}/apiCLNoteList.sh`,
  CLINICAL_NOTES_IV: `${API_BASE_URL}/apiCLNoteIV.sh`,
  PROBLEMS: `${API_BASE_URL}/apiProbCatSrh.sh`,
  PROBLEMS_SAVE: `${API_BASE_URL}/apiProbSave.sh`,
  PROBLEMS_LIST: `${API_BASE_URL}/apiProbList.sh`,
  ALLERGIES: `${API_BASE_URL}/apiAllergyList.sh`,
  ALLERGIES_SAVE: `${API_BASE_URL}/apiAllergySave.sh`,
  ALLERGIES_SEARCH: `${API_BASE_URL}/apiAllergySrh.sh`,
  DIAGNOSIS: `${API_BASE_URL}/apiDiagList.sh`,
  COMPLAINTS: `${API_BASE_URL}/apiComplaintsList.sh`,
  MEDICATIONS: `${API_BASE_URL}/apiOrdMedList.sh`,
  LAB_ORDERS: `${API_BASE_URL}/apiOrdLabList.sh`,
  RADIOLOGY_ORDERS: `${API_BASE_URL}/apiOrdRadListNew.sh`,
  PROCEDURES: `${API_BASE_URL}/apiOrdProcList.sh`,
  VITALS: `${API_BASE_URL}/apiVitalView.sh`,
  VITALS_ENTRY: `${API_BASE_URL}/apiVitalEntry.sh`,
  NOTE_DELETE: `${API_BASE_URL}/apiNotDel.sh`,
  NOTE_SIGN: `${API_BASE_URL}/apiNotSign.sh`,
  CPOE_LIST: `${API_BASE_URL}/apiOrdCPOEList.sh`
} as const;

// API Service Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Patient {
    id: string;
    name: string;
    avatarUrl: string;
    gender: string;
    age: number;
    dob: string;
    wardNo: string;
    bedDetails: string;
    admissionDate: string;
    lengthOfStay: string;
    mobile: string;
    primaryConsultant: string;
    specialty: string;
    encounterProvider: string;
    finalDiagnosis: string;
    posting: string;
    reasonForVisit: string;
    ssn: string;
    // API response fields
    "Admission Date": string;
    Age: string | number;
    Bed: string;
    DFN: number;
    DOB: string;
    Gender: string;
    "IP No": number;
    LOS: string;
    "Mobile No": number;
    Name: string;
    "Primary Consultant": string;
    "Secondary Consultant": string;
    Specialty: string;
    "Treating Consultant": string;
    Ward: string;
}

interface PatientSearchParams {
    UserName: string;
    Password: string;
    DUZ: string;
    PatientSSN: string;
    lname: string;
    cpDOB: string;
    mno: string;
    cpIPNo: string;
    SearchType: string;
}

export const apiService = {
    async getPatients(searchParams: Record<string, any> = {}) {
        try {
            const params = {
                UserName: 'CPRS-UAT',
                Password: 'UAT@123',
                DUZ: '115',
                PatientSSN: searchParams.searchSSN || "",
                lname: searchParams.lname || "",
                cpDOB: searchParams.cpDOB || "",
                mno: searchParams.mno || "",
                cpIPNo: searchParams.cpIPNo || "",
                SearchType: searchParams.SearchType || "1"
            };

            const response = await api.post(API_ENDPOINTS.PATIENTS, params);

            if (response.data && typeof response.data === 'object') {
                // Convert the object of patients to an array
                const patients = Object.values(response.data);
                
                if (searchParams.searchSSN) {
                    return patients.filter((p: any) => 
                        (p.SSN || p['SSN No'] || '') === searchParams.searchSSN
                    );
                }
                return patients;
            }
            return [];
        } catch (error) {
            console.error('Error in getPatients:', error);
            throw error;
        }
    }
};

export async function fetchClinicalNotes({
    patientSSN,
    fromDate = '',
    toDate = '',
    status,
    ihtLocation = 102,
    ewd_sessid = '',
    DUZ = '80',
}: {
    patientSSN: string;
    fromDate?: string;
    toDate?: string;
    status?: string;
    ihtLocation?: number;
    ewd_sessid?: string;
    DUZ?: string;
}) {
    // Ensure dates are in YYYY-MM-DD format
    const formatDate = (dateStr: string): string => {
        if (!dateStr) return '';
        try {
            // Try to parse the date string and reformat it
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return '';
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (e) {
            console.error('Error formatting date:', e);
            return '';
        }
    };

    // Only format dates if they are provided
    const formattedFromDate = fromDate ? formatDate(fromDate) : '';
    const formattedToDate = toDate ? formatDate(toDate) : '';

    const body: any = {
        UserName: 'CPRS-UAT',
        Password: 'UAT@123',
        PatientSSN: patientSSN,
        DUZ,
        ihtLocation,
        ewd_sessid,
    };

    // Only add date fields if they have values
    if (formattedFromDate) body.FromDate = formattedFromDate;
    if (formattedToDate) body.ToDate = formattedToDate;
    if (status) body.status = status;

    console.log('Sending request to clinical notes API:', {
        url: API_ENDPOINTS.CLINICAL_NOTES,
        body: JSON.stringify(body, null, 2)
    });

    try {
        const response = await api.post(API_ENDPOINTS.CLINICAL_NOTES, body, {
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000, // 10 second timeout
        });

        console.log('Clinical notes API response status:', response.status);
        
        if (!response.data) {
            console.error('Empty response from clinical notes API');
            return [];
        }


        if (response.data.errors) {
            console.error('API Error:', response.data.errors);
            return [];
        }


        if (Array.isArray(response.data)) {
            return response.data;
        }


        if (typeof response.data === 'object') {
            return Object.values(response.data);
        }

        console.warn('Unexpected response format from API:', response.data);
        return [];
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Axios error fetching clinical notes:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                responseData: error.response?.data,
                request: {
                    url: error.config?.url,
                    method: error.config?.method,
                    data: error.config?.data,
                    headers: error.config?.headers,
                },
            });
        } else {
            console.error('Error in fetchClinicalNotes:', error);
        }
        return [];
    }
} 

export interface ProblemSearchParams {
    UserName: string;
    Password: string;
    PatientSSN: string;
    DUZ: string;
    cdpProbCat?: string;
    other?: string;
  }
  
  export interface Problem {
    id: string;
    problem: string;
    dateOfOnset: string;
    status: string;
    immediacy: string;
    orderIen: number;
    editUrl: string;
    removeUrl: string;
    viewUrl: string;
  }
  
  export const problemService = {
    searchProblems: async (params: ProblemSearchParams): Promise<Problem[]> => {
      try {
        const response = await api.post(API_ENDPOINTS.PROBLEMS, params);
        // Transform the API response to match our Problem interface
        return response.data.map((item: any) => ({
          id: item.id || '',
          problem: item.problem || '',
          dateOfOnset: item.dateOfOnset || '',
          status: item.status || '',
          immediacy: item.immediacy || '',
          orderIen: item.orderIen || 0,
          editUrl: item.editUrl || '',
          removeUrl: item.removeUrl || '',
          viewUrl: item.viewUrl || '',
        }));
      } catch (error) {
        console.error('Error searching problems:', error);
        throw error;
      }
    }
  };

export const authApi = {
  login: async (credentials: { access: string; verify: string; htLocation?: string }) => {
    const response = await axios.post(API_ENDPOINTS.LOGIN, {
      ...credentials,
      UserName: 'CPRS-UAT',  // Keep these for initial login only
      Password: 'UAT@123'     // These will be replaced after first successful login
    });
    return response.data;
  },
  
  getLocations: async (accessCode: string) => {
    const response = await axios.post(API_ENDPOINTS.LOCATIONS, {
      access: accessCode,
      UserName: 'CPRS-UAT',  // Keep these for initial location fetch
      Password: 'UAT@123'
    });
    return response.data;
  }
};

// Export the configured axios instance
export default api;