import React from "react";

const repos = [
  { name: "RepoSummarizer", commits: 24, updated: "2025-03-25" },
  { name: "TailwindStarter", commits: 42, updated: "2025-03-20" },
  { name: "RustAPI", commits: 15, updated: "2025-03-18" },
];

export default function Repositories() {
  return (
    <div>
      <h2 className="text-3xl font-semibold text-white mb-6">📦 Your Repositories</h2>
      <div className="space-y-4">
        {repos.map((repo, idx) => (
          <div key={idx} className="p-4 bg-gray-700 rounded-lg shadow hover:bg-gray-600 transition duration-300 flex justify-between items-center">
            <div>
              <h3 className="text-xl text-white font-medium">{repo.name}</h3>
              <p className="text-sm text-gray-400">{repo.commits} commits</p>
            </div>
            <span className="text-gray-300">{repo.updated}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
