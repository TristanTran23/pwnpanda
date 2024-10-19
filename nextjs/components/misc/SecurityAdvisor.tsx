//nextjs/components/misc/SecurityAdvisor.tsx

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SecurityAdvisor() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/security-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setResponse(data.result);
    } catch (error) {
      console.error('Error:', error);
      setResponse('An error occurred while processing your request.');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask about online security..."
          className="w-full"
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Processing...' : 'Get Advice'}
        </Button>
      </form>
      {response && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <h3 className="font-bold mb-2">Security Advice:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
