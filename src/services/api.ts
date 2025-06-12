import axios from 'axios';

const API_BASE_URL = 'http://3.6.230.54:4003/api'

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

export const api = {
    async getPatients(searchSSN?: string) {
        try {
            const searchParams: PatientSearchParams = {
                UserName: "CPRS-UAT",
                Password: "UAT@123",
                DUZ: "115",
                PatientSSN: searchSSN || "",
                lname: "",
                cpDOB: "",
                mno: "",
                cpIPNo: "",
                SearchType: searchSSN ? "1" : "2"
            };

            const response = await axios.post(`${API_BASE_URL}/apiPatDetail.sh`, searchParams, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
                const patients = Object.values(response.data);
                if (searchSSN) {
                    return patients.filter((p: any) => String(p.SSN || '') === searchSSN);
                } else {
                    return patients;
                }
            }
            return [];
        } catch (error) {
            console.error('Error fetching patients:', error);
            return [];
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
    DUZ = '115',
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

    const formattedFromDate = formatDate(fromDate);
    const formattedToDate = formatDate(toDate || new Date().toISOString().split('T')[0]);

    const body: any = {
        UserName: 'CPRS-UAT',
        Password: 'UAT@123',
        PatientSSN: patientSSN,
        FromDate: formattedFromDate,
        ToDate: formattedToDate,
        DUZ,
        ihtLocation,
        ewd_sessid,
    };

    if (status) {
        body.status = status;
    }

    console.log('Sending request to clinical notes API:', {
        url: `${API_BASE_URL}/apiCLNoteList.sh`,
        body: JSON.stringify(body, null, 2)
    });

    try {
        const response = await axios.post(`${API_BASE_URL}/apiCLNoteList.sh`, body, {
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