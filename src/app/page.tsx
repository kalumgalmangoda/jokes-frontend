'use client';

import { useEffect, useState } from 'react';

interface Joke {
  id: number;
  type: string;
  content: string;
}

export default function Home() {
  const [randomJoke, setRandomJoke] = useState<Joke | null>(null);
  const [jokeTypes, setJokeTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchRandomJoke();
    fetchJokeTypes();
  }, []);

  const fetchRandomJoke = async () => {
    try {
      const response = await fetch('http://localhost:3003/jokes/random');
      const joke: Joke = await response.json();
      setRandomJoke(joke);
    } catch (error) {
      console.error('Failed to fetch random joke:', error);    
    }
  };

  const fetchJokeTypes = async () => {
    try {
      const response = await fetch('http://localhost:3003/jokes/types');

      const typesData: { id: number; type: string }[] = await response.json();
      const types = typesData.map((type) => type.type);
      setJokeTypes(types);
    } catch (error) {
      console.error('Failed to fetch jokeTypes:', error);    
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Random Joke</h2>
        {randomJoke ? (
          <p>{randomJoke.content}</p>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <div>
        <h2 className="text-xl font-bold">Joke Types</h2>
        <ul>
          {jokeTypes.map(type => (
            <li key={type}>{type}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
