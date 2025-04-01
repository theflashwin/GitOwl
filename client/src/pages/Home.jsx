import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import LiquidBackground from "../components/LiquidBackground";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { trim_url } from "../middlewares/processing";
import { VerificationStates } from "../middlewares/states";
import InlineSpinner from "../components/InlineSpinner";
import AnimatedLoader from "../components/AnimatedLoader";
import user_auth from "../auth";

export default function Home() {

  const navigate = useNavigate()

  const [repoUrl, setRepoUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(VerificationStates.NEED_TO_VERIFY);
  const [error, setError] = useState("")

  const { user, authLoading, isLoggedIn } = user_auth()

  const api = import.meta.env.VITE_API_URL

  const handleSummarize = async () => {

    setLoading(true)

    console.log(isLoggedIn)

    if (!isLoggedIn) {
      setError("You must log in to summarize repos.")
      setLoading(false)
      return;
    }

    const data = verifying == VerificationStates.VALID ? {
      "repo_path": repoUrl,
      "user_id": user.uid
    } : {
      "repo_path": repoUrl,
      "api_key": apiKey,
      "user_id": user.uid
    }

    await axios.post(`${api}/summarize`, data)
      .then((response) => {

        console.log(response)

        if (response.data.status === "success") {

          const trimmed_repo_url = trim_url(repoUrl)
          navigate(`/${trimmed_repo_url}`)

        } else {

          setError(response.data.message)

        }

      })
      .catch((err) => {
        setError("Some network error occurred.")
      })

    console.log("exit")
    setLoading(false)

  };

  useEffect(() => {
    const verifyRepo = async () => {
      if (!repoUrl.trim()) {
        setVerifying(VerificationStates.NEED_TO_VERIFY);
        return;
      }

      setVerifying(VerificationStates.LOADING);

      try {
        const response = await axios.get(`${api}/verify-access`, {
          params: { repo_url: repoUrl }  // <-- corrected to use params
        });

        console.log(response)

        if (response.data.status === "success") {
          setVerifying(VerificationStates.VALID);
        } else if (response.data.status === "failure") { // <-- corrected typo "states" to "status"
          setVerifying(VerificationStates.INVALID);
        } else {
          console.log("Unexpected response:", response.data);
          setVerifying(VerificationStates.NEED_TO_VERIFY);
        }

      } catch (err) {
        console.log("Error verifying repo:", err);
        setVerifying(VerificationStates.NEED_TO_VERIFY);
      }
    };

    verifyRepo();

  }, [repoUrl]);

  useEffect(() => {

    if (apiKey.trim()) {
      setVerifying(VerificationStates.VERIFIED)
    }

  }, [apiKey])

  return (
    <div>
      {loading ? <AnimatedLoader /> : (
        <div className="relative w-full h-screen overflow-hidden bg-gradient-to-r from-blue-800 via-yellow-00 to-blue-800">
          <Navbar />

          {/* Fullscreen Canvas */}
          <Canvas
            camera={{ position: [0, 0, 1] }}
            className="absolute top-0 left-0 w-full h-full"
          >
            <LiquidBackground />
          </Canvas>

          {/* Content Overlay */}
          <div className="absolute text-center inset-0 flex flex-col items-center justify-center z-10 px-4 sm:px-6 md:px-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-extrabold mb-2 sm:mb-4">
              Generate Changelogs. Fast.
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-4 sm:mb-6 max-w-2xl">
              Enter a GitHub repository URL to summarize its commits
            </p>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full max-w-md sm:max-w-2xl">
              <input
                type="text"
                placeholder="Enter GitHub repo URL"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="px-3 py-2 sm:px-4 sm:py-3 w-full rounded-lg border border-white bg-gray-700 text-white placeholder-gray-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />

              <button
                onClick={handleSummarize}
                className={`px-4 py-2 sm:px-6 sm:py-3 text-white rounded-md font-bold focus:ring transform transition duration-300 ease-in-out flex items-center justify-center ${verifying !== VerificationStates.VALID && verifying !== VerificationStates.VERIFIED
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-sky-700 to-amber-600 hover:from-pink-500 hover:to-green-500 hover:scale-105"
                  }`}
                disabled={verifying !== VerificationStates.VALID && verifying !== VerificationStates.VERIFIED}
              >
                {verifying === VerificationStates.LOADING ? <InlineSpinner /> : "Summarize"}
              </button>
            </div>

            {/* Conditionally render API key textbox */}
            <div
              className={`overflow-hidden transition-all duration-500 w-full max-w-md sm:max-w-2xl ${verifying === VerificationStates.INVALID || verifying === VerificationStates.VERIFIED
                  ? "max-h-40 opacity-100 mt-4 sm:mt-6"
                  : "max-h-0 opacity-0 mt-0"
                }`}
            >
              <div className="bg-gray-800 bg-opacity-75 backdrop-filter backdrop-blur-lg p-3 sm:p-4 rounded-lg shadow-lg w-full">
                <p className="text-sm sm:text-base text-gray-100 mb-2">🔑 This repository appears private. Please provide your GitHub API Key:</p>
                <input
                  type="text"
                  placeholder="GitHub API Key"
                  onChange={(e) => setApiKey(e.target.value)}
                  className="px-3 py-2 sm:px-4 sm:py-2 w-full rounded-lg border border-green-500 bg-gray-700 text-white placeholder-gray-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
                />
              </div>
            </div>

            <div
              className={`overflow-hidden transition-all duration-500 w-full max-w-md sm:max-w-2xl ${error ? "max-h-40 opacity-100 mt-4 sm:mt-6" : "max-h-0 opacity-0 mt-0"
                }`}
            >
              <div className="bg-red-600 bg-opacity-80 backdrop-filter backdrop-blur-lg p-3 sm:p-4 rounded-lg shadow-xl text-white">
                <span className="font-bold">⚠️ Error:</span> {error}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}
