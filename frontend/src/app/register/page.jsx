"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/lib/api";
import { motion } from "framer-motion";
import GalaxyBackground from "@/components/GalaxyBackground";
import { Eye, EyeOff, Briefcase } from "lucide-react";

export default function RegisterPage() {

    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showModal, setShowModal] = useState(false);

    async function handleRegister(e) {

        e.preventDefault();

        if (!name || !email || !password) {
            setError("All fields are required");
            return;
        }

        try {

            setLoading(true);
            setError("");
            setSuccess("");

            const res = await registerUser(name, email, password);

            if (res.status === "error") {
                setError(res.message || "Registration failed");
                return;
            }

            setSuccess("Account created successfully");

            setTimeout(() => {
                router.push("/login");
            }, 1500);

        } catch (err) {

            console.error(err);
            setError("Registration failed. Please try again.");

        } finally {

            setLoading(false);

        }
    }

    return (

        <div className="relative min-h-screen flex items-center justify-center px-4 text-gray-200 overflow-hidden bg-[#020617]">

            <GalaxyBackground />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md
                bg-[#0f172a]/70
                backdrop-blur-2xl
                border border-white/10
                shadow-[0_20px_80px_rgba(0,0,0,0.7)]
                p-8 rounded-2xl"
            >

                {/* Brand */}

                <div className="flex flex-col items-center mb-6">

                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl mb-3 shadow-lg">
                        <Briefcase size={24} className="text-white" />
                    </div>

                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        RecruitFlow
                    </h2>

                    <p className="text-xs text-gray-400 mt-1">
                        AI Powered Hiring Platform
                    </p>

                </div>

                {error && (
                    <div className="mb-4 text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded-lg p-2">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 text-green-400 text-sm text-center bg-green-500/10 border border-green-500/30 rounded-lg p-2">
                        {success}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">

                    {/* Name */}

                    <input
                        placeholder="Full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full 
                        bg-white/[0.04]
                        border border-white/10
                        focus:border-indigo-500
                        text-white
                        rounded-lg
                        px-4 py-2.5
                        text-sm
                        placeholder:text-gray-500
                        focus:outline-none
                        focus:ring-2
                        focus:ring-indigo-500/30
                        transition-all"
                    />

                    {/* Email */}

                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full 
                        bg-white/[0.04]
                        border border-white/10
                        focus:border-indigo-500
                        text-white
                        rounded-lg
                        px-4 py-2.5
                        text-sm
                        placeholder:text-gray-500
                        focus:outline-none
                        focus:ring-2
                        focus:ring-indigo-500/30
                        transition-all"
                    />

                    {/* Password */}

                    <div className="relative">

                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full 
                            bg-white/[0.04]
                            border border-white/10
                            focus:border-indigo-500
                            text-white
                            rounded-lg
                            px-4 py-2.5
                            text-sm
                            placeholder:text-gray-500
                            focus:outline-none
                            focus:ring-2
                            focus:ring-indigo-500/30
                            transition-all"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-gray-500 hover:text-indigo-400 transition"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>

                    </div>

                    {/* Register Button */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full
                        bg-gradient-to-r from-indigo-500 to-purple-600
                        hover:from-indigo-600 hover:to-purple-700
                        text-white text-sm font-medium
                        py-2.5 rounded-lg
                        shadow-lg
                        transition-all
                        hover:scale-[1.02]"
                    >
                        {loading ? "Registering..." : "Create Account"}
                    </button>

                </form>

                {/* Divider */}

                <div className="flex items-center gap-3 my-5">

                    <div className="flex-1 h-px bg-white/10"></div>

                    <span className="text-xs text-gray-400">
                        OR
                    </span>

                    <div className="flex-1 h-px bg-white/10"></div>

                </div>

                {/* Social Buttons */}

                <div className="space-y-3">

                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full
                        bg-white/[0.04]
                        border border-white/10
                        hover:border-indigo-500
                        hover:bg-white/[0.06]
                        py-2.5 rounded-lg
                        text-sm
                        transition-all"
                    >
                        Continue with Google
                    </button>

                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full
                        bg-white/[0.04]
                        border border-white/10
                        hover:border-indigo-500
                        hover:bg-white/[0.06]
                        py-2.5 rounded-lg
                        text-sm
                        transition-all"
                    >
                        Continue with GitHub
                    </button>

                </div>

                {/* Login Link */}

                <p className="mt-6 text-sm text-center text-gray-400">

                    Already have an account?{" "}

                    <Link
                        href="/login"
                        className="text-indigo-400 hover:text-indigo-300 font-medium transition"
                    >
                        Login
                    </Link>

                </p>

            </motion.div>

            {/* Modal */}

            {showModal && (

                <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">

                    <motion.div
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-[#0f172a]
                        border border-white/10
                        rounded-2xl
                        p-6
                        text-center
                        max-w-sm
                        shadow-xl"
                    >

                        <h3 className="text-lg font-semibold text-white mb-2">
                            Feature Coming Soon 🚀
                        </h3>

                        <p className="text-sm text-gray-400 mb-4">
                            This feature will be available in a future update.
                        </p>

                        <button
                            onClick={() => setShowModal(false)}
                            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm transition"
                        >
                            Close
                        </button>

                    </motion.div>

                </div>

            )}

        </div>
    );
}