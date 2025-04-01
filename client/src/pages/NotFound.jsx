import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
        404
      </h1>
      <p className="mt-4 text-xl font-semibold">
        This repository doesn't exist yet. Go to the homepage to make it a reality!
      </p>
      <button
        onClick={() => navigate('/')}
        className="mt-8 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md transition duration-300"
      >
        Go Home
      </button>
    </div>
  );
};

export default NotFound;
