"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/lib/api";
import { saveToken } from "@/lib/auth";
import { motion } from "framer-motion";
import GalaxyBackground from "@/components/GalaxyBackground";
import { Eye, EyeOff, Briefcase } from "lucide-react";

export default function LoginPage() {

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [showModal, setShowModal] = useState(false);

    async function handleLogin(e) {

        e.preventDefault();

        if (!email || !password) {
            setError("Email and password are required");
            return;
        }

        try {

            setLoading(true);
            setError("");

            const res = await loginUser(email, password);

            if (res.status === "error") {
                setError(res.message || "Login failed");
                return;
            }

            saveToken(res.token);

            const role = res.user?.role;

            if (role === "hr") {
                router.push("/dashboard");
            } else {
                router.push("/candidate/dashboard");
            }

        } catch (err) {

            console.error(err);
            setError("Login failed. Please try again.");

        } finally {

            setLoading(false);

        }
    }

    return (

        <div className="relative min-h-screen flex items-center justify-center px-4 text-gray-200 overflow-hidden">

            <GalaxyBackground />

            {/* Login Card */}

            <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative z-10 w-full max-w-md bg-black/60 backdrop-blur-xl border border-gray-800 p-8 rounded-xl shadow-2xl"
            >

                {/* Brand */}

                <div className="flex flex-col items-center mb-6">

                    <div className="bg-indigo-600/20 p-3 rounded-full mb-2">
                        <Briefcase size={24} className="text-indigo-400" />
                    </div>

                    <h2 className="text-2xl font-semibold text-white tracking-wide">
                        RecruitFlow
                    </h2>

                    <p className="text-xs text-gray-400">
                        AI Recruitment Platform
                    </p>

                </div>

                {error && (
                    <div className="mb-4 text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded-lg p-2">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">

                    {/* Email */}

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-gray-700 bg-black/40 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />

                    {/* Password */}

                    <div className="relative">

                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-700 bg-black/40 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2 text-gray-400 hover:text-white"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>

                    </div>

                    {/* Remember + Forgot */}

                    <div className="flex items-center justify-between text-xs text-gray-400">

                        <label className="flex items-center gap-2 cursor-pointer">

                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={() => setRemember(!remember)}
                                className="accent-indigo-500"
                            />

                            Remember me

                        </label>

                        <button
                            type="button"
                            onClick={() => setShowModal(true)}
                            className="hover:text-indigo-400"
                        >
                            Forgot password?
                        </button>

                    </div>

                    {/* Login Button */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg transition hover:scale-[1.02]"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                {/* Divider */}

                <div className="flex items-center gap-3 my-5">

                    <div className="flex-1 h-px bg-gray-700"></div>
                    <span className="text-xs text-gray-400">OR</span>
                    <div className="flex-1 h-px bg-gray-700"></div>

                </div>

                {/* Social Buttons */}

                <div className="space-y-3">

                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full border border-gray-700 hover:border-indigo-500 py-2 rounded-lg text-sm transition"
                    >
                        Continue with Google
                    </button>

                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full border border-gray-700 hover:border-indigo-500 py-2 rounded-lg text-sm transition"
                    >
                        Continue with GitHub
                    </button>

                </div>

                {/* Register */}

                <p className="mt-5 text-sm text-center text-gray-400">
                    No account?{" "}
                    <Link
                        href="/register"
                        className="text-indigo-400 hover:text-indigo-300 transition"
                    >
                        Register
                    </Link>
                </p>

            </motion.div>

            {/* Coming Soon Modal */}

            {showModal && (

                <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center max-w-sm"
                    >

                        <h3 className="text-lg font-semibold text-white mb-2">
                            Feature Coming Soon 🚀
                        </h3>

                        <p className="text-sm text-gray-400 mb-4">
                            This feature will be available in a future update.
                        </p>

                        <button
                            onClick={() => setShowModal(false)}
                            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm"
                        >
                            Close
                        </button>

                    </motion.div>

                </div>

            )}

        </div>

    );
}