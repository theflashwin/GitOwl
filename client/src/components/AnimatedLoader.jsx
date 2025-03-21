// AnimatedLoader.jsx
import React, { useEffect, useState } from 'react';

const messages = [
  "Fetching repository data...",
  "Analyzing commit history...",
  "Generating summary...",
  "Optimizing results...",
  "Finalizing changelog..."
];

export default function AnimatedLoader() {
  const [currentMessage, setCurrentMessage] = useState(messages[0]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setCurrentMessage(messages[i]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="loader mb-8">
        <div className="cube"></div>
        <div className="cube"></div>
        <div className="cube"></div>
        <div className="cube"></div>
      </div>
      <h2 className="text-xl font-semibold animate-pulse">{currentMessage}</h2>

      <style jsx>{`
        .loader {
          width: 60px;
          height: 60px;
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          justify-content: center;
        }

        .cube {
          width: 25px;
          height: 25px;
          background: #3b82f6;
          animation: bounce 1.5s infinite ease-in-out;
          border-radius: 4px;
        }

        .cube:nth-child(2) {
          animation-delay: 0.3s;
        }

        .cube:nth-child(3) {
          animation-delay: 0.6s;
        }

        .cube:nth-child(4) {
          animation-delay: 0.9s;
        }

        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.5); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
