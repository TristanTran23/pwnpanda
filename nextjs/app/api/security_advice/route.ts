//API route: nextjs/app/api/security_advice/route.ts

import { NextResponse } from 'next/server';
import { getSecurityAdvice } from '@/utils/openai/api';

export async function POST(request: Request) {
  const { prompt } = await request.json();

  try {
    const result = await getSecurityAdvice(prompt);
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred while processing your request' }, { status: 500 });
  }
}