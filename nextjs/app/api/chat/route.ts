import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fetch from 'node-fetch';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const HIBP_API_KEY = process.env.HIBP_API_KEY;

async function checkHaveIBeenPwned(email: string) {
  const response = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${email}`, {
    method: 'GET',
    headers: {
      'hibp-api-key': HIBP_API_KEY as string,
      'user-agent': 'YourAppName'
    }
  });

  if (response.status === 404) {
    return "Good news! This email hasn't been found in any known data breaches.";
  } else if (response.ok) {
    const breaches = await response.json() as any;
    return `This email was found in ${breaches.length} data breach(es). Here are the details: ${JSON.stringify(breaches)}`;
  } else {
    throw new Error('Failed to check HaveIBeenPwned');
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, email, isFirstMessage } = body;

    if (isFirstMessage) {
      if (!email) {
        return NextResponse.json({ error: 'Email is required for the first message' }, { status: 400 });
      }
      const hibpResult = await checkHaveIBeenPwned(email);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {role: "system", content: "You are a helpful assistant that provides online security advice. You have just received information about an email address from the HaveIBeenPwned API. Provide a helpful interpretation of this information and offer advice on what steps the user should take next."},
          {role: "user", content: `Here's the result of the HaveIBeenPwned check: ${hibpResult}`}
        ],
        max_tokens: 250,
      });

      const aiMessage = response.choices[0]?.message?.content;
      if (!aiMessage) {
        throw new Error('No response generated from OpenAI');
      }

      const reply = `${hibpResult}\n\nHere's some advice based on this information:\n${aiMessage.trim()}`;
      return NextResponse.json({ reply });
    }

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {role: "system", content: "You are a helpful assistant that provides online security advice."},
        {role: "user", content: message}
      ],
      max_tokens: 150,
    });

    const aiMessage = response.choices[0]?.message?.content;
    if (!aiMessage) {
      throw new Error('No response generated from OpenAI');
    }

    const reply = aiMessage.trim();
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request' }, { status: 500 });
  }
}