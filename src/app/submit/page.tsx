'use client';

import { useState, FormEvent, useEffect } from 'react';

export default function Submit() {
  const [type, setType] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [jokeTypes, setJokeTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchJokeTypes();
  }, []);

  const fetchJokeTypes = async () => {
    try {
      const response = await fetch('http://localhost:3001/jokes/types');
      const types = await response.json();
      setJokeTypes(types);
      setType(types[0]); // Set the default type
    } catch (error) {
      console.error('Failed to fetch joke types:', error);
    }
  };

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
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            required
          >
            {jokeTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {/* <input
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            required
          /> */}
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
