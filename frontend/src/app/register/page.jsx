"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/lib/api";

export default function RegisterPage() {

    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

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
                    HR Register
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

                {success && (
                    <div
                        style={{
                            marginBottom: "15px",
                            color: "#16a34a",
                            fontSize: "14px"
                        }}
                    >
                        {success}
                    </div>
                )}

                <form onSubmit={handleRegister}>

                    <input
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={inputStyle}
                    />

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
                        {loading ? "Registering..." : "Register"}
                    </button>

                </form>

                <p
                    style={{
                        marginTop: "15px",
                        fontSize: "14px",
                        textAlign: "center"
                    }}
                >
                    Already have an account?{" "}
                    <Link href="/login">
                        Login
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