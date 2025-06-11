import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { noteId } = await request.json();
    
    if (!noteId) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch('http://3.6.230.54:4003/api/apiNotDel.sh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        UserName: 'CPRS-UAT',
        Password: 'UAT@123',
        LTIUTMPIEN: noteId,
        DUZ: '115',
        ihtLocation: '102',
        NotPagTyp: 3
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting clinical note:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete clinical note' },
      { status: 500 }
    );
  }
}
