import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      // Navigates to results page with the website URL as a query parameter
      navigate(`/results?url=${encodeURIComponent(url)}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-xl font-bold mb-4">Enter Website URL to Analyze</h1>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="border border-gray-300 p-2 rounded w-full mb-4"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
          Analyze
        </button>
      </form>
    </div>
  );
};

export default Home;
