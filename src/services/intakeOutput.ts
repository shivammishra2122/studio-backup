// src/services/intakeOutput.ts
export const fetchIntakeUpdateData = async (patientSSN: string): Promise<IntakeOutputSummary> => {
  if (!patientSSN) {
    throw new Error('Patient SSN is required');
  }

  const apiUrl = 'http://3.6.230.54:4003/api/apiIntakeOutput.sh';
  const requestBody = {
    UserName: 'CPRS-UAT',
    PatientSSN: patientSSN,
    DUZ: '115',
    ihtLocation: 102,
    FromDate: '',
    ToDate: '',
    Action: 'I',
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the API response to match our interface
    const records: IntakeOutputRecord[] = Array.isArray(data) ? data.map((item: any) => ({
      id: item.Id || Math.random().toString(36).substr(2, 9),
      timestamp: item.Timestamp || new Date().toISOString(),
      type: item.Type === 'OUTPUT' ? 'OUTPUT' : 'INTAKE',
      category: item.Category || 'Unknown',
      amount: parseFloat(item.Amount) || 0,
      unit: item.Unit || 'ml',
      route: item.Route,
      note: item.Note
    })) : [];

    // Calculate totals
    const totalIntake = records
      .filter(record => record.type === 'INTAKE')
      .reduce((sum, record) => sum + record.amount, 0);

    const totalOutput = records
      .filter(record => record.type === 'OUTPUT')
      .reduce((sum, record) => sum + record.amount, 0);

    return {
      totalIntake,
      totalOutput,
      balance: totalIntake - totalOutput,
      records: records.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    };
  } catch (error) {
    console.error('Error fetching intake/update data:', error);
    throw error;
  }
};

export const fetchIntakeOutputData = async (patientSSN: string): Promise<IntakeOutputSummary> => {
  if (!patientSSN) {
    throw new Error('Patient SSN is required');
  }

  const apiUrl = 'http://3.6.230.54:4003/api/apiIntakeOutput.sh';
  const requestBody = {
    UserName: 'CPRS-UAT',
    PatientSSN: patientSSN,
    DUZ: '115',
    ihtLocation: 102,
    FromDate: '',
    ToDate: '',
    Action: 'O',
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the API response to match our interface
    // Note: You'll need to adjust this based on the actual API response structure
    const records: IntakeOutputRecord[] = Object.entries(data).map(([key, value]: [string, any]) => ({
      id: key,
      timestamp: value.Timestamp || new Date().toISOString(),
      type: value.Type === 'OUTPUT' ? 'OUTPUT' : 'INTAKE',
      category: value.Category || 'Unknown',
      amount: parseFloat(value.Amount) || 0,
      unit: value.Unit || 'ml',
      route: value.Route,
      note: value.Note
    }));

    // Calculate totals
    const totalIntake = records
      .filter(record => record.type === 'INTAKE')
      .reduce((sum, record) => sum + record.amount, 0);

    const totalOutput = records
      .filter(record => record.type === 'OUTPUT')
      .reduce((sum, record) => sum + record.amount, 0);

    return {
      totalIntake,
      totalOutput,
      balance: totalIntake - totalOutput,
      records: records.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    };
  } catch (error) {
    console.error('Error fetching intake/output data:', error);
    throw error;
  }
};

export interface IntakeOutputRecord {
  id: string;
  timestamp: string;
  type: 'INTAKE' | 'OUTPUT';
  category: string;
  amount: number;
  unit: string;
  route?: string;
  note?: string;
}

export interface IntakeOutputSummary {
  totalIntake: number;
  totalOutput: number;
  balance: number;
  records: IntakeOutputRecord[];
}