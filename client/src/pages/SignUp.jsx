import React, { useState } from "react";
import { auth, googleProvider } from "../firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { IoMailOutline, IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { Canvas } from "@react-three/fiber";
import LiquidBackground from "../components/LiquidBackground";
import { useNavigate, Link } from "react-router-dom";

import Navbar from "../components/Navbar";

export default function Signup() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const signUpWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            navigate("/");
        } catch (err) {
            setError(err.message);
        }
    };

    const signUpWithEmail = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            navigate("/");
        } catch (err) {
            setError(err.message);
        }
    };

    return (

        <div className="relative w-full h-screen overflow-hidden bg-gradient-to-r from-blue-800 via-yellow-00 to-blue-800">

            <Canvas camera={{ position: [0, 0, 1] }} className="absolute top-0 left-0 w-full h-full">
                <LiquidBackground />
            </Canvas>

            <Navbar />

            <div className="absolute text-center inset-0 flex flex-col items-center justify-center z-10">

                <h1 className="text-4xl font-bold text-center mb-6 text-gray-100">Create Your Account</h1>

                <div className="w-[500px] bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-8 text-gray-200">
                    {error && (
                        <div className="bg-red-500 bg-opacity-20 text-red-400 rounded px-3 py-2 mb-4 text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <IoMailOutline className="absolute left-3 top-3.5 text-xl text-gray-400" />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-700 rounded-lg pl-10 pr-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            />
                        </div>

                        <div className="relative">
                            <IoLockClosedOutline className="absolute left-3 top-3.5 text-xl text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-700 rounded-lg pl-10 pr-10 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-xl text-gray-400"
                            >
                                {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                            </button>
                        </div>

                        <button
                            onClick={signUpWithEmail}
                            className="w-full bg-gray-500 hover:bg-gray-600 rounded-lg py-3 font-semibold transition duration-300"
                        >
                            Sign Up
                        </button>
                    </div>

                    <div className="flex items-center my-6">
                        <hr className="flex-grow border-gray-600" />
                        <span className="mx-3 text-gray-400">OR</span>
                        <hr className="flex-grow border-gray-600" />
                    </div>

                    <button
                        onClick={signUpWithGoogle}
                        className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 rounded-lg py-3 font-semibold transition duration-300"
                    >
                        <FcGoogle className="text-xl" /> Sign up with Google
                    </button>

                    <p className="text-sm text-gray-400 text-center mt-6">
                        Already have an account? <Link to="/login" className="underline text-gray-300">Log in</Link>
                    </p>

                    <p className="text-xs text-gray-500 text-center mt-4">
                        By signing up, you agree to the <Link to="#" className="underline text-gray-400">Terms of Use</Link> and <Link to="#" className="underline text-gray-400">Privacy Policy</Link>.
                    </p>
                </div>

            </div>


        </div>

    );
}