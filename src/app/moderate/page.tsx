'use client';

import { useEffect, useState, FormEvent, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';

interface SubmittedJoke {
  _id: string;
  type: string;
  content: string;
}
interface Joke {
  // id: number;
  type: string;
  content: string;
}

interface DecodedToken {
  exp: number;
}

export default function Moderate() {
  const [joke, setJoke] = useState<SubmittedJoke | null>(null);
  const [jokeTypes, setJokeTypes] = useState<string[]>([]);
  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem('token') || '';
  });
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [editingJoke, setEditingJoke] = useState<Joke | null>(null);

  const [inputJokeTypesValue, setInputJokeTypesValue] = useState(editingJoke?.type || '');
  const [inputJokeContentValue, setInputJokeContentValue] = useState(editingJoke?.content || '');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [filteredTypes, setFilteredTypes] = useState(jokeTypes);
  // const inputRef = useRef(null);

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
      fetchJoke();
      fetchJokeTypes();
    }
  }, [token]);

  const fetchJoke = async () => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3002/jokes', {
        headers: { 'x-access-token': token },
      });
      // console.log("----------fetchJokes-response---------",response)

      if (!response.ok) {
        // Handle token expiry or invalid token
        setToken('');
        localStorage.removeItem('token');
        return;
      }

      const jokeData: SubmittedJoke = await response.json();
      if (jokeData) setJoke(jokeData);
    } catch (error) {
      setJoke(null)
      console.error('Failed to fetch jokes:', error);
    }
  };

  const fetchJokeTypes = async () => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3002/jokes/types', {
        headers: { 'x-access-token': token },
      });
      // console.log("----------fetchJokeTypes-response---------",response)

      if (!response.ok) {
        // Handle token expiry or invalid token
        setToken('');
        localStorage.removeItem('token');
        return;
      }

      const typesData: { id: number; type: string }[] = await response.json();
      const types = typesData.map((type) => type.type);
      setJokeTypes(types);
      // console.log("----------fetchJokeTypes-response---------",types)
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
      fetchJoke();
    } catch (error) {
      console.error('Failed to delete joke:', error);
    }
  };

  const handleEdit = (joke: SubmittedJoke) => {
    const editingJokeData = {
      type: joke.type,
      content: joke.content,    
    }
    setEditingJoke(editingJokeData);
    // console.log("-------------------101---------",editingJokeData)
  };

  const handleUpdateJoke = async (e: FormEvent) => {
    e.preventDefault();
    if (joke) {
      setJoke({
        ...joke,
        type: inputJokeTypesValue,
        content: inputJokeContentValue,
      });
    }
    setEditingJoke(null);

    // if (editingJoke) {
    //   await fetch(`http://localhost:3002/jokes/${editingJoke.id}`, {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json', 'x-access-token': token },
    //     body: JSON.stringify(editingJoke),
    //   });
    //   setEditingJoke(null);
    //   fetchJokes();
    // }
  };

  const handleSubmitToDeliver = async (joke: SubmittedJoke) => {
    await fetch('http://localhost:3002/jokes/deliver', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-access-token': token },
      body: JSON.stringify(joke),
    });
    handleDelete(joke._id);
  };

  useEffect(() => {
    setInputJokeTypesValue(editingJoke?.type || '');
    setInputJokeContentValue(editingJoke?.content || '');
  }, [editingJoke]);

  useEffect(() => {
    setFilteredTypes(jokeTypes.filter(type => type.toLowerCase().includes(inputJokeTypesValue.toLowerCase())));
  }, [inputJokeTypesValue, jokeTypes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputJokeTypesValue(e.target.value);
    // if (e.target.value === '') {
    //   setIsDropdownVisible(false);
    // } else {
    //   setIsDropdownVisible(true);
    // }
  };

  const handleInputFocus = () => {
    setIsDropdownVisible(true);
    setFilteredTypes(jokeTypes)
  };

  const handleInputBlur = () => {
    // Delay hiding the dropdown to allow click events
    setTimeout(() => setIsDropdownVisible(false), 300);
  };

  const handleOptionClick = (type: string) => {
    // console.log("-------------------102---------",type)
    setInputJokeTypesValue(type);
    setIsDropdownVisible(false);
  };

  const handleAddNewType = () => {
    if (inputJokeTypesValue && !jokeTypes.includes(inputJokeTypesValue)) {
      jokeTypes.push(inputJokeTypesValue); // Update the jokeTypes list
    }
    // handleUpdateJoke(); // Call this to handle the updated joke
  };

  const handleChangeJokeContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputJokeContentValue(e.target.value);
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
            {/* {jokes.map(joke => ( */}
              {joke ? <li key={joke._id} className="flex flex-col justify-between mt-4">
                <span className='text-lg font-bold'>Joke Type: <span className="text-gray-600 font-normal">{joke.type}</span></span>
                <span className='text-lg font-bold mb-2'>Joke: <span className="text-gray-600 font-normal">{joke.content}</span></span>
                <div>
                  <button
                    onClick={() => handleEdit(joke)}
                    className="bg-yellow-600 text-white px-2 py-1 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleSubmitToDeliver(joke)}
                    className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => handleDelete(joke._id)}
                    className="bg-red-600 text-white px-2 py-1 rounded mr-2"
                  >
                    Reject
                  </button>
                </div>
              </li> : 'No any submitted jokes'}
            {/* ))} */}
          </ul>
          {editingJoke && (
            <form onSubmit={handleUpdateJoke} className="mt-4 space-y-4">
              <div>
                <label className="block text-gray-700">Joke Type</label>
                <input
                  type="text"
                  value={inputJokeTypesValue}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  // ref={inputRef}
                  className="w-full px-4 py-2 border rounded"
                  placeholder="Select or add new type"
                />
                {isDropdownVisible && filteredTypes.length > 0 && (
                  <ul className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded shadow-lg">
                    {filteredTypes.map(type => (
                      <li
                        key={type}
                        onClick={() => handleOptionClick(type)}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                      >
                        {type}
                      </li>
                    ))}
                  </ul>
                )}
                {/* <select
                  value={editingJoke.type}
                  onChange={handleChangeJokeType}
                  className="w-full px-4 py-2 border rounded"
                >
                  {jokeTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select> */}
              </div>
              <div>
                <label className="block text-gray-700">Content</label>
                <textarea
                  value={inputJokeContentValue}
                  onChange={handleChangeJokeContent}
                  className="w-full px-4 py-2 border rounded"
                  rows={5}
                />
              </div>
              <button type="submit" className="bg-blue-600 text-white px-2 py-1 rounded">
                Update Joke
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
