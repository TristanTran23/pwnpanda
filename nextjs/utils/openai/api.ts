// nextjs/utils/openai/api.ts

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getSecurityAdvice(prompt: string): Promise<string> {
  try {
    const response = await openai.completions.create({
      model: "text-davinci-003", 
      prompt: `Provide online security advice for the following question: ${prompt}`,
      max_tokens: 150,
    }); 
    console.log(response);
    return response.choices[0].text.trim();
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to get security advice');
  }
}