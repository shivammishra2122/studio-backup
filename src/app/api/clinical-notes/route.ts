import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Prepare the request data with required fields
    const requestData = {
      UserName: 'CPRS-UAT',
      Password: 'UAT@123',
      PatientSSN: '210099218',
      IPNo: '153381',
      AdmissionDate: '',
      Status: body.status || 'DRAFT',
      EntredID: '',
      PeripheralIVInfusionTracker: '',
      Insertion: '',
      Shift: '',
      CannulaInsertionDateandTime: new Date().toISOString(),
      SizeofCannula: '',
      SiteofInsertion: body.title || 'Clinical Note',
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
      TypeofFluid: body.content || '',
      Effect: '',
      EntredUserID: 'SI112233',
      EntredDateTime: new Date().toISOString(),
      EditUserID: '',
      EditDateTime: ''
    };

    const response = await fetch('http://3.6.230.54:4003/api/apiCLNoteIV.sh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in clinical notes API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
