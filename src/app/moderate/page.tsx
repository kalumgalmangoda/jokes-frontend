'use client';

import { useEffect, useState, FormEvent } from 'react';
import { jwtDecode } from 'jwt-decode';

interface SubmittedJoke {
  _id: string;
  type: string;
  content: string;
}
interface Joke {
  id: number;
  type: string;
  content: string;
}

interface DecodedToken {
  exp: number;
}

export default function Moderate() {
  const [jokes, setJokes] = useState<SubmittedJoke[]>([]);
  const [jokeTypes, setJokeTypes] = useState<string[]>([]);
  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem('token') || '';
  });
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const isTokenExpired = (token: string): boolean => {
    const decodedToken: DecodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  };

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      // Handle token expiry or invalid token
      setToken('');
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchJokes();
      fetchJokeTypes();
    }
  }, [token]);

  const fetchJokes = async () => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3002/jokes', {
        headers: { 'x-access-token': token },
      });
      console.log("----------fetchJokes-response---------",response)

      if (!response.ok) {
        // Handle token expiry or invalid token
        setToken('');
        localStorage.removeItem('token');
        return;
      }

      const jokes: SubmittedJoke[] = await response.json();
      setJokes(jokes);
    } catch (error) {
      console.error('Failed to fetch jokes:', error);
    }
  };

  const fetchJokeTypes = async () => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3002/jokes/types', {
        headers: { 'x-access-token': token },
      });
      console.log("----------fetchJokeTypes-response---------",response)

      if (!response.ok) {
        // Handle token expiry or invalid token
        setToken('');
        localStorage.removeItem('token');
        return;
      }

      const types: string[] = await response.json();
      setJokeTypes(types);
    } catch (error) {
      console.error('Failed to fetch jokeTypes:', error);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3002/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
      } else {
        // Handle login error
        console.error('Login failed:', data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;

    try {
      await fetch(`http://localhost:3002/jokes/${id}`, {
        method: 'DELETE',
        headers: { 'x-access-token': token },
      });
      fetchJokes();
    } catch (error) {
      console.error('Failed to delete joke:', error);
    }
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
              <li key={joke._id} className="flex justify-between items-center">
                <span>{joke.content}</span>
                <button
                  onClick={() => handleDelete(joke._id)}
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
