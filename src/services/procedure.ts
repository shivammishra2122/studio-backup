export interface ProcedureOrder {
  id: string;
  orderId: string;
  order: string;
  service: string;
  provider: string;
  location: string;
  startDate: string;
  stopDate: string;
  status: string;
  viewUrl: string;
}

export const fetchProcedureOrders = async (patientSSN: string): Promise<ProcedureOrder[]> => {
  const apiUrl = 'http://3.6.230.54:4003/api/apiOrdProcList.sh';
  const requestBody = {
    UserName: 'CPRS-UAT',
    Password: 'UAT@123',
    PatientSSN: patientSSN || '670768354',
    DUZ: '115',
    ihtLocation: 102,
    FromDate: '',
    ToDate: '',
    rcpAdmDateL: ''
  };

  console.log('Making API request to:', apiUrl);
  console.log('Request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json().catch(async (e) => {
      const text = await response.text();
      console.error('Failed to parse JSON response. Response text:', text);
      throw new Error(`Failed to parse JSON response: ${e.message}`);
    });

    console.log('API Response:', data);
    
    if (!data || typeof data !== 'object') {
      console.error('Invalid API response format:', data);
      throw new Error('Invalid API response format');
    }

    // Transform the API response to match our interface
    const result = Object.entries(data).map(([key, value]: [string, any]) => {
      const item = {
        id: key,
        orderId: value['Order IEN']?.toString() || key,
        order: value['Order'] || 'N/A',
        service: value['Service'] || 'N/A',
        provider: value['Provider']?.split('/').map((p: string) => p.trim()).join(', ') || 'N/A',
        location: value['Location'] || 'N/A',
        startDate: value['Start Date'] || 'N/A',
        stopDate: value['Stop Date'] || 'N/A',
        status: value['Status'] || 'UNKNOWN',
        viewUrl: value['URLView'] || '#',
      };
      console.log('Processed item:', item);
      return item;
    });

    return result;
  } catch (error) {
    console.error('Error in fetchProcedureOrders:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
};
