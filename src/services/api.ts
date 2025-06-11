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
    const body: any = {
        UserName: 'CPRS-UAT',
        Password: 'UAT@123',
        PatientSSN: patientSSN,
        FromDate: fromDate,
        ToDate: toDate,
        DUZ,
        ihtLocation,
        ewd_sessid,
    };

    if (status !== undefined) {
        body.status = status;
    }

    try {
        const response = await axios.post(`${API_BASE_URL}/apiCLNoteList.sh`, body, {
            headers: { 'Content-Type': 'application/json' },
        });

        console.log('Clinical Notes API Response:', response.data);

        if (response.data && typeof response.data === 'object') {
            if (response.data.errors) {
                console.error('API Error:', response.data.errors);
                return [];
            }
            return Object.values(response.data);
        }
        return [];
    } catch (error) {
        console.error('Error fetching clinical notes:', error);
        return [];
    }
} 