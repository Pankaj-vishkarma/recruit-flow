"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/lib/api";
import { saveToken } from "@/lib/auth";

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
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                background: "#f5f7fb"
            }}
        >

            <div
                style={{
                    width: "360px",
                    background: "#fff",
                    padding: "30px",
                    borderRadius: "10px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
                }}
            >

                <h2
                    style={{
                        marginBottom: "20px",
                        textAlign: "center"
                    }}
                >
                    HR Login
                </h2>

                {error && (
                    <div
                        style={{
                            marginBottom: "15px",
                            color: "#ef4444",
                            fontSize: "14px"
                        }}
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={inputStyle}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={inputStyle}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={buttonStyle}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <p
                    style={{
                        marginTop: "15px",
                        fontSize: "14px",
                        textAlign: "center"
                    }}
                >
                    No account?{" "}
                    <Link href="/register">
                        Register
                    </Link>
                </p>

            </div>

        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "14px"
};

const buttonStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: "14px",
    cursor: "pointer"
};