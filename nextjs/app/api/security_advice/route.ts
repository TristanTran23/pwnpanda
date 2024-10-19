//API route: nextjs/app/api/security_advice/route.ts

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getSecurityAdvice } from '../../../utils/openai/api';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const result = await getSecurityAdvice(prompt);
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error in security advice route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}