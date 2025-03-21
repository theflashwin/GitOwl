import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

import { useParams } from "react-router-dom";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";

export default function EditPage() {

    const [loading, setLoading] = useState(true)
    const [searchParams] = useSearchParams()

    const [title, setTitle] = useState()
    const [description, setDescription] = useState()
    const [owner, setOwner] = useState()
    const [summaries, setSummaries] = useState()

    const url = searchParams.get('repo_url')
    const api = 'http://localhost:8000'
    
    useEffect(() => {
        async function fetch() {
            await axios
                .get(`${api}/getrepo`, {
                    params: { repo_path: `https://github.com/${url}` }
                })
                .then((response) => {

                    console.log(response)

                    if (response.data.status === "success") {

                        setTitle(response.data.payload.title)
                        setDescription(response.data.payload.description)
                        setOwner(response.data.payload.owner)
                        setSummaries(response.data.payload.summaries)

                        console.log(response.data.payload.summaries)

                    } else {
                        console.log("an error occurred")
                    }
                    
                })
                .catch(() => {
                    console.log("an error occurred")
                });

            setLoading(false);
        }

        if (loading) {
            fetch();
        }
    }, [loading]);

    return (
        <div className="w-full min-h-screen bg-gray-900 text-white py-10">

        <Navbar/>

          <div className="max-w-4xl mx-auto mt-5">
            {loading ? (
              <Loader />
            ) : (
              

              <div className="max-w-4xl mx-auto py-10 px-4">
<div className="mb-10">
  <div className="flex justify-between items-center mb-4">
    <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
      {title}
    </h1>
    <span className="text-xl font-semibold text-gray-300">
      By: {owner}
    </span>
  </div>

  <p className="text-lg text-gray-300 leading-relaxed max-w-3xl">
    {description}
  </p>

  <hr className="border-gray-600 mt-6"/>
</div>



  <div className="space-y-8">
    {summaries.slice().reverse().map((commit) => (
      <div
        key={commit.commit_hash}
        className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg border border-gray-700 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-white">{commit.title}</h2>
          <span className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full">
            {commit.date}
          </span>
        </div>

        <p className="text-gray-300 mb-4">{commit.description}</p>

        <ul className="list-disc list-inside text-gray-200 space-y-1">
          {commit.changes.map((change, idx) => (
            <li key={idx}>{change}</li>
          ))}
        </ul>

        <div className="mt-6 text-xs text-gray-400 border-t border-gray-700 pt-4">
          <p><strong>Commit Hash:</strong> {commit.commit_hash}</p>
          <p><strong>Author:</strong> {commit.author}</p>
        </div>
      </div>
    ))}
  </div>
</div>



            )}
          </div>
        </div>
      );

}