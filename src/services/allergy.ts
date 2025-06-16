// src/services/allergy.ts

export interface ApiAllergySavePayload {
    UserName: string;
    Password: string;
    PatientSSN: string;
    DUZ: string;
    ihtLocation: string;
    cdaAllrgyS: string;
    cdaNatRea: string;
    cdaObsHis: string;
    cdaSrty: string;
    cdaReDat: string;
    cdaSignSymL: string;
    cdaDatTm: string;
    cdaCMT: string;
    cdaNotKnow: string;
}

export const saveAllergy = async (payload: ApiAllergySavePayload) => {
    try {
        const response = await fetch('/api/apiAllergySave.sh', {
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
        console.error('Error saving allergy:', error);
        throw error;
    }
};