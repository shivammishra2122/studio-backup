interface AllergySearchParams {
  UserName: string;
  Password: string;
  PatientSSN: string;
  cpProvDiag: string;
  iAllrgy: string;
  DUZ: string;
}

export interface AllergySearchResult {
  // Define the structure based on the actual API response
  // These are example fields, adjust according to the actual API response
  id: string;
  name: string;
  // Add other fields as needed
}

export const searchAllergies = async (params: AllergySearchParams): Promise<AllergySearchResult[]> => {
  try {
    const response = await fetch('http://3.6.230.54:4003/api/apiAllergySrh.sh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        UserName: params.UserName,
        Password: params.Password,
        PatientSSN: params.PatientSSN,
        cpProvDiag: params.cpProvDiag,
        iAllrgy: params.iAllrgy,
        DUZ: params.DUZ,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data as AllergySearchResult[];
  } catch (error) {
    console.error('Error searching allergies:', error);
    throw error;
  }
};
