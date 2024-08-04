'use client';

import { useState, FormEvent } from 'react';

export default function Submit() {
  const [type, setType] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const response = await fetch('http://localhost:3001/jokes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, content }),
    });

    if (response.ok) {
      setMessage('Joke submitted successfully!');
      setType('');
      setContent('');
    } else {
      setMessage('Failed to submit joke.');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold">Submit a Joke</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Type</label>
          <input
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            required
          ></textarea>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Submit
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
