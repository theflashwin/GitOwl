import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

import { useParams } from "react-router-dom";
import { EditPageStates } from "../middlewares/states";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import user_auth from "../auth";
import CommitCard from "../components/CommitCard";

export default function EditPage() {

  const [pageLoading, setPageLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()

  const [title, setTitle] = useState()
  const [description, setDescription] = useState()
  const [owner, setOwner] = useState()
  const [summaries, setSummaries] = useState()

  const [verification, setVerification] = useState(EditPageStates.NEED_TO_VERIFY)
  const [error, setError] = useState("")

  const [apiKey, setApiKey] = useState("")

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);

  const [isOwner, setIsOwner] = useState(false)

  const { user, authLoading, isLoggedIn } = user_auth()

  const navigate = useNavigate()

  const url = searchParams.get('repo_url')
  const api = import.meta.env.VITE_API_URL;

  useEffect(() => {
    console.log(authLoading)
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

            console.log(response.data.payload.users)

            if (response.data.payload.users && response.data.payload.users[user.uid]) {
              setIsOwner(true);
            }
    

          } else {
            navigate("/notfound")
          }

        })
        .catch((err) => {

          console.log(err)

        });

      setPageLoading(false);
    }

    if (pageLoading && !authLoading) {
      fetch()
    }
  }, [pageLoading, authLoading]);

  const handleUpdate = async () => {

    setLoading(true)

    console.log(isLoggedIn)

    if (!isLoggedIn) {
      setLoading(false)
      setError("You must be logged in to update repositories")
      return;
    }

    console.log("hey")

    try {
      const response = await axios.get(`${api}/verify-access`, {
        params: { repo_url: `https://github.com/${url}` }  // <-- corrected to use params
      });

      console.log(response)

      if (response.data.status === "success") {

        // send the update request

        const data = {
          "repo_path": `https://github.com/${url}`,
          "user_id": user.uid
        }

        const update_response = await axios.post(`${api}/update`, data)

        console.log(update_response)

        if (update_response.data.status === "success") {
          window.location.reload();
        } else {
          setError(update_response.data.message)
        }

      } else if (response.data.status === "failure") { // <-- corrected typo "states" to "status"

        setVerification(EditPageStates.SHOW_POP_UP)

      } else {
        setError("Failed to verify your access.")
      }

    } catch (err) {
      console.log(err)
      setError("Some network error occurred")
    }

    setLoading(false)

  }

  const handleUpdateFromPopUp = async () => {
    if (!apiKey.trim()) return;

    setLoading(true);

    if (!isLoggedIn) {
      setLoading(false)
      setError("You must be logged in to update repositories")
      return;
    }

    try {
      const data = {
        "repo_path": `https://github.com/${url}`,
        "api_key": apiKey,
        "user_id": user.uid
      };

      const update_response = await axios.post(`${api}/update`, data);

      console.log(update_response)

      if (update_response.data.status === "success") {
        window.location.reload();
      } else {
        setError("Backend error occurred.");
      }

    } catch (err) {
      console.log(err)
      setError("Network error occurred.");
    }

    setLoading(false);
  };

  const handleTitleUpdate = async () => {

    try {
      setEditingTitle(false);
      await axios.post(`${api}/edit-repo-title`, {
        "repo_url": `https://github.com/${url}`,
        "new_title": title,
      }).catch((err) => {
        console.log(err)
        setError("Failed to update Title. Please try again.");
      });
    } catch (err) {
      console.log(err)
      setError("Failed to update Title. Please try again.");
    }

  }

  const handleDescriptionUpdate = async () => {

    try {
      setEditingDescription(false);
      await axios.post(`${api}/edit-repo-description`, {
        "repo_url": `https://github.com/${url}`,
        "new_description": description,
      }).catch((err) => {
        setError("Failed to update description. Please try again.");
      });
    } catch (err) {
      setError("Failed to update description. Please try again.");
    }

  }

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white py-10">

      <Navbar />

      {error && (
        <div className="max-w-4xl mx-auto mt-6 px-4">
          <div className="bg-red-500 bg-opacity-20 text-white rounded-xl shadow-xl p-4 text-center">
            ⚠️ {error}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto mt-5">
        {pageLoading ? (
          <Loader />
        ) : (


          <div className="max-w-4xl mx-auto py-10 px-4">

            {isOwner ? <div className="mb-4 p-2 bg-gray-800 border-l-4 border-green-500 text-white font-bold text-sm">
              💡 Tip: Double-click on any field to edit it.
            </div> : <div/>}

            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                {editingTitle ? (
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleUpdate}
                    autoFocus
                    className="text-5xl font-extrabold bg-gray-700 text-white rounded px-2 outline-none border border-gray-600"
                  />

                ) : (
                  <h1
                    className="text-5xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent cursor-pointer"
                    onDoubleClick={() => setEditingTitle(isOwner)}
                  >
                    {title}
                  </h1>
                )}

                <span className="text-xl font-semibold text-gray-300">
                  By: {owner}
                </span>
              </div>

              {editingDescription ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleDescriptionUpdate}
                  autoFocus
                  rows={3}
                  className="w-full bg-gray-700 text-gray-200 rounded px-3 py-2 border border-gray-600 outline-none text-lg leading-relaxed max-w-3xl"
                />
              ) : (
                <p
                  className="text-lg text-gray-300 leading-relaxed max-w-3xl cursor-pointer"
                  onDoubleClick={() => setEditingDescription(isOwner)}
                >
                  {description}
                </p>
              )}


              <hr className="border-gray-600 mt-6" />
            </div>

            <div className="space-y-8">

              {isOwner ? <div className="mb-8">
                <button
                  className="w-full py-3 border-2 border-dotted border-green-500 text-white rounded-xl text-xl font-semibold shadow hover:bg-green-500 hover:bg-opacity-10 hover:text-green-300 transition duration-300"
                  onClick={handleUpdate}
                >
                  🔄 Update
                </button>
              </div> : <div/>}

              {summaries.length === 0 ? (
                <div className="w-full border border-dashed border-gray-600 rounded-xl p-10 text-center bg-gray-800 bg-opacity-40 shadow-lg">
                  <h3 className="text-2xl font-semibold text-white mb-4">⏳ Summarizing in Progress...</h3>
                  <p className="text-gray-300 mb-4">
                    We're currently analyzing and summarizing the commits in this repository.
                  </p>
                  <p className="text-sm text-gray-400">
                    Please check back in a few minutes to view your changelog.
                  </p>
                </div>
              ) : (
                summaries
                  .slice()
                  .reverse()
                  .map((commit) => <CommitCard key={commit.commit_hash} commit={commit} repo_url={url} isOwner={isOwner} />)
              )}


            </div>
          </div>



        )}
      </div>

      {/* API Key Input Pop-up */}
      {verification == EditPageStates.SHOW_POP_UP && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-filter backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 shadow-2xl max-w-md w-full">
            <h2 className="text-2xl text-white font-semibold mb-4">🔑 API Key Required</h2>
            <p className="text-gray-300 mb-4">
              This repository appears private. Please provide your GitHub API key to update.
            </p>
            <input
              type="text"
              placeholder="Enter your GitHub API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setVerification(EditPageStates.NEED_TO_VERIFY)
                }}
                className="px-4 py-2 text-gray-300 rounded-md hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateFromPopUp}
                disabled={!apiKey.trim()}
                className={`px-4 py-2 bg-green-600 text-white rounded-md transition duration-300 ${!apiKey.trim() ? "opacity-50 cursor-not-allowed" : "hover:bg-green-500"
                  }`}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {(loading || pageLoading) && (
        <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-90 backdrop-filter backdrop-blur-lg flex flex-col items-center justify-center">
          <Loader />
          <p className="mt-4 text-xl text-gray-200 animate-pulse">
            Summarizing repository commits...
          </p>
        </div>
      )}

    </div>
  );

}