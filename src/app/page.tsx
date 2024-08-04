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
  const [selectedType, setSelectedType] = useState<string>('');
  const [noJokesMessage, setNoJokesMessage] = useState<string>('');

  useEffect(() => {
    fetchJokeTypes();
  }, []);

  const fetchRandomJoke = async (type: string) => {
    try {
      const response = await fetch(`http://localhost:3003/jokes/random?type=${type}`);
      if (response.ok) {
        const joke: Joke = await response.json();
        setRandomJoke(joke);
        setNoJokesMessage(''); // Clear any previous message
      } else if (response.status === 404) {
        setRandomJoke(null);
        setNoJokesMessage(`No jokes available for type: ${type}`);
      } else {
        throw new Error('Failed to fetch joke');
      }
    } catch (error) {
      console.error('Failed to fetch random joke:', error);    
      setRandomJoke(null);
      setNoJokesMessage('Error fetching joke. Please try again.');
    }
  };

  const fetchJokeTypes = async () => {
    try {
      const response = await fetch('http://localhost:3003/jokes/types');

      const typesData: { id: number; type: string }[] = await response.json();
      const types = typesData.map((type) => type.type);
      setJokeTypes(types);
      if (types.length > 0) {
        setSelectedType(types[0]);
        fetchRandomJoke(types[0]);
      }
    } catch (error) {
      console.error('Failed to fetch jokeTypes:', error);    
    }
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const type = event.target.value;
    setSelectedType(type);
    fetchRandomJoke(type);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Joke Types</h2><select
          value={selectedType}
          onChange={handleTypeChange}
          className="w-full px-4 py-2 border rounded"
        >
          {jokeTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div>
        <h2 className="text-xl font-bold">Random Joke</h2>
        {randomJoke ? (
          <p>{randomJoke.content}</p>
        ) : (
          <p>{noJokesMessage || 'Loading...'}</p>
        )}
      </div>
    </div>
  );
}
