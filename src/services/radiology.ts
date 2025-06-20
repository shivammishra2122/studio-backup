interface RadiologyApiOrder {
  "Change": string;
  "Copy": string;
  "Discontinue": string;
  "Exam Date/Time": string;
  "Flag": string;
  "Imaging Procedure": string;
  "Imaging Type": string;
  "Location": string;
  "Order Flag": string;
  "Order IEN": number;
  "Provider": string;
  "Result": string;
  "Sign": string;
  "Status": string;
  "Unflag": string;
  "View": string;
}

export interface RadiologyApiResponse {
  [key: string]: RadiologyApiOrder;
}

export interface RadiologyEntry {
  id: string;
  sNo: string;
  imagingProcedure: string;
  imagingType: string;
  orderDateTime: string;
  status: 'ACTIVE' | 'COMPLETE' | 'UNRELEASED';
  provider: string;
  location: string;
  result: string;
  viewUrl: string;
  signUrl: string;
  changeUrl: string;
  copyUrl: string;
  discontinueUrl: string;
  flagUrl: string;
  unflagUrl: string;
}

export const fetchRadiologyOrders = async (patientIdentifier: string): Promise<RadiologyEntry[]> => {
  if (!patientIdentifier?.trim()) {
    throw new Error('Patient identifier is required');
  }
  
  const apiUrl = 'http://3.6.230.54:4003/api/apiOrdRadListNew.sh';
  const requestBody = {
    UserName: 'CPRS-UAT',
    Password: 'UAT@123',
    PatientSSN: patientIdentifier.trim(),
    DUZ: '115',
    ihtLocation: 102,
    FromDate: '',
    ToDate: '',
    rcpoeOrdSt: '11'
  };
  
  console.log('Fetching radiology orders for patient:', patientIdentifier);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('API response status:', response.status, response.statusText);
    
    if (!response.ok) {
      let errorMessage = `HTTP error! Status: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // If we can't parse the error response, use the default error message
      }
      throw new Error(errorMessage);
    }

    const data: RadiologyApiResponse = await response.json();
    console.log('API response data:', data);
    
    // Check if the response is empty or not in the expected format
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from server');
    }
    
    // Transform the API response to match our interface
    const entries: RadiologyEntry[] = Object.entries(data).map(([sNo, value]) => {
      // Ensure we have a valid status
      const status = (
        value.Status === 'COMPLETE' ? 'COMPLETE' :
        value.Status === 'UNRELEASED' ? 'UNRELEASED' :
        'ACTIVE'
      ) as 'ACTIVE' | 'COMPLETE' | 'UNRELEASED';

      return {
        id: value["Order IEN"]?.toString() || sNo,
        sNo,
        imagingProcedure: value["Imaging Procedure"] || 'N/A',
        imagingType: value["Imaging Type"] || 'N/A',
        orderDateTime: value["Exam Date/Time"] || 'N/A',
        status,
        provider: value.Provider || 'N/A',
        location: value.Location || 'N/A',
        result: value.Result || '',
        viewUrl: value.View || '#',
        signUrl: value.Sign || '#',
        changeUrl: value.Change || '#',
        copyUrl: value.Copy || '#',
        discontinueUrl: value.Discontinue || '#',
        flagUrl: value.Flag || '#',
        unflagUrl: value.Unflag || '#'
      };
    });

    console.log('Transformed radiology entries:', entries);
    return entries;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};
