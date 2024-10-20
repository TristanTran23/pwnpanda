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
    const { message, email, isFirstMessage, conversationHistory } = body;

    let messages = [];

    if (isFirstMessage) {
      if (!email) {
        return NextResponse.json({ error: 'Email is required for the first message' }, { status: 400 });
      }
      const hibpResult = await checkHaveIBeenPwned(email);
      
      messages = [
        {role: "system", content: "You are a helpful assistant named PwnPanda that provides online security advice in a conversational manner. You have just received information about an email address from the HaveIBeenPwned API. Provide a helpful interpretation of this information and offer advice on what steps the user should take next. Try to keep the response 3 to 5 sentences. Make sure to say all the names of the breaches. Don't give markdown output. On this first message, don't immediately give advice, but ask the user to ask questions"},
        {role: "user", content: `Here's the result of the HaveIBeenPwned check: ${hibpResult}`}
      ];
    } else {
      if (!message) {
        return NextResponse.json({ error: 'No message provided' }, { status: 400 });
      }
      
      messages = [
        {role: "system", content: "You are a helpful assistant named PwnPanda that provides online security advice in a conversational manner. You have previously recieved information about data breacjes. Provide a helpful interpretation of this information and offer advice on what steps the user should take next. Try to keep the response 3 to 5 sentences. Don't give markdown output."},
        ...(Array.isArray(conversationHistory) ? conversationHistory : []),
        {role: "user", content: message}
      ];
    }

    // Ensure all messages have the required 'role' field
    messages = messages.map(msg => {
      if (!msg.role) {
        console.warn('Message without role detected:', msg);
        return { ...msg, role: 'user' }; // Default to 'user' if role is missing
      }
      return msg;
    });

    console.log('Messages being sent to OpenAI:', JSON.stringify(messages, null, 2));

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
      max_tokens: 250,
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