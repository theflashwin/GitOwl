import React from "react";
import { FiHome, FiCreditCard, FiGitBranch, FiLogOut } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; // Adjust your import accordingly

export default function Sidebar({ activeTab, setActiveTab }) {
    const navigate = useNavigate();

    const linkStyle = (tab) =>
        `flex text-white items-center gap-2 px-6 py-3 cursor-pointer transition-all duration-300 ${
            activeTab === tab
                ? "bg-gray-300 text-gray-900"
                : "hover:bg-gray-200 text-gray-700"
        }`;

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Sign-out failed", error);
        }
    };

    return (
        <nav className="w-64 bg-gray-700 border-r border-none py-8 flex flex-col justify-between">
            <div>
                <div className="w-full">
                    <Link
                        to={"/"}
                        className="block text-3xl font-extrabold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-blue-400 bg-clip-text text-transparent text-center mb-10"
                    >
                        Git Parrot
                    </Link>
                </div>

                <ul className="space-y-2">
                    <li className={linkStyle("home")} onClick={() => setActiveTab("home")}>
                        <FiHome /> Home
                    </li>
                    <li className={linkStyle("billing")} onClick={() => setActiveTab("billing")}>
                        <FiCreditCard /> Billing
                    </li>
                    <li className={linkStyle("repositories")} onClick={() => setActiveTab("repositories")}>
                        <FiGitBranch /> Repositories
                    </li>
                </ul>
            </div>

            <button
                className="flex items-center justify-center mb-8 gap-2 mx-6 py-2 rounded-md text-gray-200 hover:text-white hover:bg-red-500 transition duration-300"
                onClick={handleSignOut}
            >
                <FiLogOut /> Sign Out
            </button>
        </nav>
    );
}
