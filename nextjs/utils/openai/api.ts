// nextjs/utils/openai/api.ts

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getSecurityAdvice(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {role: "system", content: "You are a helpful assistant that provides online security advice."},
        {role: "user", content: prompt}
      ],
      max_tokens: 150,
    });

    const message = response.choices[0]?.message?.content;
    if (!message) {
      throw new Error('No response generated from OpenAI');
    }

    return message.trim();
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error instanceof Error ? error : new Error('An unknown error occurred');
  }
}