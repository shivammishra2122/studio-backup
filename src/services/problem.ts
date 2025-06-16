// src/services/problem.ts

export interface ApiProbSavePayload {
    UserName: string;
    Password: string;
    PatientSSN: string;
    DUZ: string;
    ihtLocation: string;
    cdpProbL: string;
    cpClinic: string;
    cdpDOSet: string;
    cdpStts: string;
    cdpServ: string;
    cdpImmed: string;
    cdpCMT: string;
    cpWard: string;
    DUZIP: string;
}

export const saveProblem = async (payload: ApiProbSavePayload) => {
    try {
        const response = await fetch('/api/apiProbSave.sh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error saving problem:', error);
        throw error;
    }
};
