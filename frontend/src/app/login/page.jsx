"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/lib/api";
import { saveToken } from "@/lib/auth";
import { motion } from "framer-motion";

export default function LoginPage() {

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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

        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-indigo-50 px-4">

            <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg"
            >

                <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
                    HR Login
                </h2>

                {error && (
                    <div className="mb-4 text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition disabled:opacity-60"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <p className="mt-5 text-sm text-center text-gray-600">
                    No account?{" "}
                    <Link
                        href="/register"
                        className="text-blue-600 hover:underline"
                    >
                        Register
                    </Link>
                </p>

            </motion.div>

        </div>

    );
}