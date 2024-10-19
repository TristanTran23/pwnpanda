import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessage = body.message;

    if (!userMessage) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {role: "system", content: "You are a helpful assistant that provides online security advice."},
        {role: "user", content: userMessage}
      ],
      max_tokens: 150,
    });

    const message = response.choices[0]?.message?.content;
    if (!message) {
      throw new Error('No response generated from OpenAI');
    }

    const reply = message.trim();
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request' }, { status: 500 });
  }
}