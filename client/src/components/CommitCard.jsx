import React, { useState } from "react";
import axios from "axios";

export default function CommitCard({ commit, repo_url, isOwner }) {
    const [editingTitle, setEditingTitle] = useState(false);
    const [editingDescription, setEditingDescription] = useState(false);
    const [editingChanges, setEditingChanges] = useState(Array(commit.changes.length).fill(false));

    const [title, setTitle] = useState(commit.title);
    const [description, setDescription] = useState(commit.description);
    const [changes, setChanges] = useState(commit.changes);

    const [error, setError] = useState("");
    const [deleted, setDeleted] = useState(false)

    const api = import.meta.env.VITE_API_URL;

    const editTitle = async () => {
        try {
            setEditingTitle(false);
            await axios.post(`${api}/edit-commit-title`, {
                "repo_url": `https://github.com/${repo_url}`,
                "commit_hash": commit.commit_hash,
                "new_title": title,
            })
                .then((response) => {
                    console.log(response)
                })
                .catch((err) => {
                    setError("Failed to update description. Please try again.");
                });
        } catch (err) {
            setError("Failed to update description. Please try again.");
        }
    };

    const editDescription = async () => {
        try {
            setEditingDescription(false);
            await axios.post(`${api}/edit-commit-description`, {
                "repo_url": `https://github.com/${repo_url}`,
                "commit_hash": commit.commit_hash,
                "new_description": description,
            }).catch((err) => {
                setError("Failed to update description. Please try again.");
            });
        } catch (err) {
            setError("Failed to update description. Please try again.");
        }
    };

    const editBullet = async (idx) => {
        try {
            setEditingChanges((prev) => {
                const copy = [...prev];
                copy[idx] = false;
                return copy;
            });

            await axios.post(`${api}/edit-commit-bullet`, {
                "repo_url": `https://github.com/${repo_url}`,
                "commit_hash": commit.commit_hash,
                "index": idx,
                "new_bullet": changes[idx],
            }).catch((err) => {
                setError("Failed to update description. Please try again.");
            });
        } catch (err) {
            setError("Failed to update bullet point. Please try again.");
        }
    };

    const handleDelete = async (idx) => {

        try {

            await axios.post(`${api}/delete-commit`, {
                "repo_url": `https://github.com/${repo_url}`,
                "commit_hash": commit.commit_hash,
            })
            .then((response) => {

                if (response.data.status === "success") {
                    setDeleted(true)
                } else {
                    setError(response.data.message)
                }

            })
            .catch((err) => {
                console.log(err)
                setError("Couldn't delete. Try again later.")
            })

        } catch (err) {
            console.log(err)
            setError("Some error occurred while deleting the commit.")
        }

    }

    if (deleted) {
        return <div></div>
    }

    return (
        <div className="relative bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg border border-gray-700 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            {error && (
                <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-sm p-2 rounded-t-xl text-center">
                    ⚠️ {error}
                </div>
            )}

            <div className="flex items-center justify-between mb-4 mt-2">
                {editingTitle ? (
                    <input
                        className="w-full bg-gray-600 text-white text-2xl font-semibold rounded-md p-2"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={editTitle}
                        autoFocus
                    />
                ) : (
                    <h2
                        className="text-2xl font-semibold text-white cursor-pointer"
                        onDoubleClick={() => setEditingTitle(isOwner)}
                    >
                        {title}
                    </h2>
                )}
                <span className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full ml-4">
                    {commit.date}
                </span>
            </div>

            {editingDescription ? (
                <textarea
                    className="w-full bg-gray-600 text-gray-200 rounded-md p-2 mb-4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={editDescription}
                    autoFocus
                />
            ) : (
                <p
                    className="text-gray-300 mb-4 cursor-pointer"
                    onDoubleClick={() => setEditingDescription(isOwner)}
                >
                    {description}
                </p>
            )}

            <ul className="list-disc list-inside text-gray-200 space-y-1">
                {changes.map((change, idx) =>
                    editingChanges[idx] && isOwner ? (
                        <input
                            key={idx}
                            className="w-full bg-gray-600 text-gray-200 rounded-md p-1"
                            value={change}
                            onChange={(e) =>
                                setChanges((prev) => {
                                    const copy = [...prev];
                                    copy[idx] = e.target.value;
                                    return copy;
                                })
                            }
                            onBlur={() => editBullet(idx)}
                            autoFocus
                        />
                    ) : (
                        <li
                            key={idx}
                            onDoubleClick={() =>
                                setEditingChanges((prev) => {
                                    if (isOwner) return;
                                    const copy = [...prev];
                                    copy[idx] = true;
                                    return copy;
                                })
                            }
                            className="cursor-pointer"
                        >
                            {change}
                        </li>
                    )
                )}
            </ul>

            <div className="mt-6 text-xs text-gray-400 border-t border-gray-700 pt-4">
                <p>
                    <strong>Commit Hash:</strong> {commit.commit_hash}
                </p>
                {isOwner ? <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 bg-opacity-20 text-red-300 hover:bg-opacity-30 hover:text-red-100 border border-red-400 border-opacity-40 rounded-md text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        🗑️ Delete
                    </button>
                </div> : <div/>}
            </div>
        </div>
    );
}
