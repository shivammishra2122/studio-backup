import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { noteId, signatureData } = await request.json();
    
    if (!noteId) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      );
    }
    
    // Here you can process the signatureData if needed
    // For now, we'll just log it and use the hardcoded TmpDigitalSign
    console.log('Received signature data:', signatureData ? 'Signature provided' : 'No signature data');
    
    const response = await fetch('http://3.6.230.54:4003/api/apiNotSign.sh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        UserName: 'CPRS-UAT',
        Password: 'UAT@123',
        DUZ: '115',
        ihtLocation: '102',
        LTIUTMPIEN: noteId, // Using noteId as LTIUTMPIEN
        NotPagTyp: '3',
        TmpDigitalSign: '123456' // In a real app, you might want to use the signatureData here
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error signing clinical note:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sign clinical note' },
      { status: 500 }
    );
  }
}
