import { NextRequest, NextResponse } from 'next/server';
import { analyzeSentiment } from '@/lib/services/sentimentService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = body.text || body.content || '';

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Field "text" is required.' }, { status: 400 });
    }

    const result = analyzeSentiment(text);
    return NextResponse.json({ success: true, analysis: result });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
