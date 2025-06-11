export interface IVCannulaEntryRequest {
  UserName: string;
  Password: string;
  PatientSSN: string;
  IPNo: string;
  AdmissionDate: string;
  Status: string;
  EntredID: string;
  PeripheralIVInfusionTracker: string;
  Insertion: string;
  Shift: string;
  CannulaInsertionDateandTime: string;
  SizeofCannula: string;
  SiteofInsertion: string;
  NumberofAttempts: string;
  ICannulaRemovalDateandTime: string;
  Maintenance: string;
  ActionTaken: string;
  ObserveCannula: string;
  ResiteCannula: string;
  InitiateTreatment: string;
  Removal: string;
  IVlineFlushing: string;
  RCannulaRemovalDateandTime: string;
  ConditionofCatheter: string;
  TotalindwellingTime: string;
  ReasonforRemoval: string;
  IVComplication: string;
  Cause: string;
  TypeofFluid: string;
  Effect: string;
  EntredUserID: string;
  EntredDateTime: string;
  EditUserID: string;
  EditDateTime: string;
}

export const submitIVCannulaEntry = async (data: Partial<IVCannulaEntryRequest>) => {
  try {
    const defaultData: IVCannulaEntryRequest = {
      UserName: 'CPRS-UAT',
      Password: 'UAT@123',
      PatientSSN: '',
      IPNo: '',
      AdmissionDate: '',
      Status: '',
      EntredID: '',
      PeripheralIVInfusionTracker: '',
      Insertion: '',
      Shift: '',
      CannulaInsertionDateandTime: '',
      SizeofCannula: '',
      SiteofInsertion: '',
      NumberofAttempts: '',
      ICannulaRemovalDateandTime: '',
      Maintenance: 'true',
      ActionTaken: '',
      ObserveCannula: '',
      ResiteCannula: '',
      InitiateTreatment: '',
      Removal: 'true',
      IVlineFlushing: '',
      RCannulaRemovalDateandTime: '',
      ConditionofCatheter: '',
      TotalindwellingTime: '',
      ReasonforRemoval: '',
      IVComplication: '',
      Cause: '',
      TypeofFluid: '',
      Effect: '',
      EntredUserID: 'SI112233',
      EntredDateTime: new Date().toISOString(),
      EditUserID: '',
      EditDateTime: '',
    };

    const requestData = { ...defaultData, ...data };

    const response = await fetch('http://3.6.230.54:4003/api/apiCLNoteIV.sh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting IV cannula entry:', error);
    throw error;
  }
};
