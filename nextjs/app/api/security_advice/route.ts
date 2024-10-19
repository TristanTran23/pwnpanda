//API route: nextjs/app/api/security_advice/route.ts

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getSecurityAdvice(prompt: string): Promise<string> {
  try {
    const response = await openai.completions.create({
      model: "text-davinci-003",
      prompt: `Provide online security advice for the following question: ${prompt}`,
      max_tokens: 150,
    });

    return response.choices[0].text.trim();
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to get security advice');
  }
}

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
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}