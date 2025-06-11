interface VitalEntryRequest {
  UserName: string;
  Password: string;
  PatientSSN: string;
  IPNo: string;
  Status: string;
  EntredID: string;
  Temperature: string;
  Pulse: string;
  Respiration: string;
  BloodPressure: string;
  Weight: string;
  OxygenSaturation: string;
  Pain: string;
  ReasonEntredError: string;
  EntredUserID: string;
  EntredDateTime: string;
  EditDateTime: string;
  Height: string;
  CVP: string;
  CG: string;
}

interface VitalEntryResponse {
  EntryIEN: string;
  succeeded: boolean;
}

export const submitVitalEntry = async (data: Omit<VitalEntryRequest, 'UserName' | 'Password' | 'Status' | 'EntredDateTime' | 'EditDateTime'>): Promise<VitalEntryResponse> => {
  const payload: VitalEntryRequest = {
    UserName: 'CPRS-UAT',
    Password: 'UAT@123',
    Status: 'ACTIVE',
    EntredDateTime: new Date().toLocaleDateString('en-US'),
    EditDateTime: '',
    ...data
  };

  try {
    const response = await fetch('http://3.6.230.54:4003/api/apiVitalEntry.sh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to submit vital entry');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting vital entry:', error);
    throw error;
  }
};
