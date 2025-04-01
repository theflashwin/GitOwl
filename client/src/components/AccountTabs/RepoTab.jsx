import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../components/Loader";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import user_auth from "../../auth";

export default function Repositories() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const { user, authLoading, isLoggedIn } = user_auth();
  const api = import.meta.env.VITE_API_URL;

  useEffect(() => {
    async function fetchRepos() {

      setLoading(true)

      try {
        const response = await axios.get(`${api}/get-user-repos`, {
          params: { user_id: user.uid }
        });

        if (response.data.status === "success") {
          setRepos(response.data.payload);
        } else {
          setError("Error fetching repositories.");
        }

      } catch (err) {
        console.log(err);
        setError("Network error occurred.");
      }

      setLoading(false);
    }

    
    if (loading && !authLoading) {
      fetchRepos()
    }

  }, [user, authLoading, isLoggedIn]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 text-white">
      <h2 className="text-3xl font-semibold mb-6">📦 Your Repositories</h2>

      {error && (
        <div className="bg-red-500 bg-opacity-20 text-white rounded-xl shadow-xl p-4 text-center mb-6">
          ⚠️ {error}
        </div>
      )}

      {repos.length === 0 ? (
        <p className="text-gray-400">You have no repositories yet.</p>
      ) : (
        <div className="space-y-4">
          {repos.map((repo, idx) => (
            <Link
              key={idx}
              to={`/edit?repo_url=${repo.repo_url.replace("https://github.com/", "")}`}
              className="p-4 bg-gray-700 rounded-lg shadow hover:bg-gray-600 transition duration-300 flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-medium">{repo.name}</h3>
                <p className="text-sm text-gray-400">{repo.description}</p>
              </div>
              <span className="text-gray-300">
                {format(new Date(repo.date), "MMMM d, yyyy")}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
