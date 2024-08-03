'use client';

import { useEffect, useState, FormEvent } from 'react';

interface Joke {
  id: number;
  type: string;
  content: string;
}

export default function Moderate() {
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [token, setToken] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  useEffect(() => {
    if (token) {
      fetchJokes();
    }
  }, [token]);

  const fetchJokes = async () => {
    const response = await fetch('http://localhost:3002/jokes', {
      headers: { 'x-access-token': token },
    });
    const jokes: Joke[] = await response.json();
    setJokes(jokes);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const response = await fetch('http://localhost:3002/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.token) {
      setToken(data.token);
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`http://localhost:3002/jokes/${id}`, {
      method: 'DELETE',
      headers: { 'x-access-token': token },
    });
    fetchJokes();
  };

  return (
    <div>
      {!token ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded"
              required
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Login
          </button>
        </form>
      ) : (
        <div>
          <h2 className="text-xl font-bold">Moderate Jokes</h2>
          <ul>
            {jokes.map(joke => (
              <li key={joke.id} className="flex justify-between items-center">
                <span>{joke.content}</span>
                <button
                  onClick={() => handleDelete(joke.id)}
                  className="bg-red-600 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
