import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Log the incoming request for debugging
    console.log('Received request:', body);
    
    // Forward the request to the actual API
    const response = await fetch('http://3.6.230.54:4003/api/apiProbSave.sh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...body,
        UserName: 'CPRS-UAT',
        Password: 'UAT@123',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      return NextResponse.json(
        { error: `API Error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/problems/save:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save problem' },
      { status: 500 }
    );
  }
}
