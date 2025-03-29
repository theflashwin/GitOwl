import React, { useState } from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { IoMailOutline, IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { Canvas } from "@react-three/fiber";
import LiquidBackground from "../components/LiquidBackground";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate()

    const loginWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            navigate("/")
        } catch (err) {
            setError(err.message);
        }
    };

    const loginWithEmail = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/")
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

            <h1 className="text-4xl font-bold text-center mb-8 text-white">Revolutionize your Repos. Fast.</h1>

                <div className="w-[500px] bg-gray-900 rounded-xl shadow-2xl p-8 text-gray-200">

                    <p className="text-xs text-gray-400 text-center mb-6">
                        Only login via email or Google is supported in your region.
                    </p>

                    {error && (
                        <div className="bg-red-500 bg-opacity-20 text-white rounded px-3 py-2 mb-4 text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <IoMailOutline className="absolute left-3 top-3.5 text-xl text-gray-500" />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-800 rounded-lg pl-10 pr-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="relative">
                            <IoLockClosedOutline className="absolute left-3 top-3.5 text-xl text-gray-500" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-800 rounded-lg pl-10 pr-10 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-xl text-gray-500"
                            >
                                {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                            </button>
                        </div>

                        <button
                            onClick={loginWithEmail}
                            className="w-full bg-indigo-500 hover:bg-indigo-600 rounded-lg py-3 font-semibold transition duration-300"
                        >
                            Log in
                        </button>
                    </div>

                    <div className="flex justify-between items-center text-sm mt-4">
                        <a href="#" className="text-indigo-400 hover:underline">Forgot password?</a>
                        <Link to={"/signup"} className="text-indigo-400 hover:underline"> Sign Up </Link>
                    </div>

                    <div className="flex items-center my-6">
                        <hr className="flex-grow border-gray-700" />
                        <span className="mx-3 text-gray-400">OR</span>
                        <hr className="flex-grow border-gray-700" />
                    </div>

                    <button
                        onClick={loginWithGoogle}
                        className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-lg py-3 font-semibold transition duration-300"
                    >
                        <FcGoogle className="text-xl" /> Log in with Google
                    </button>

                    <p className="text-xs text-gray-500 text-center mt-6">
                        By logging in, you agree to YourAppName's <a href="#" className="underline text-gray-400">Terms of Use</a> and <a href="#" className="underline text-gray-400">Privacy Policy</a>.
                    </p>
                </div>

            </div>


        </div>
    );
}