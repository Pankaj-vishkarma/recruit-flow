"use client";

import { useState } from "react";
import { loginUser } from "@/lib/api";
import { saveToken } from "@/lib/auth";

export default function LoginPage() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e) {

        e.preventDefault();

        if (!email || !password) {
            alert("Email and password required");
            return;
        }

        try {

            setLoading(true);

            const res = await loginUser(email, password);

            if (res.status === "error") {
                alert(res.message || "Login failed");
                return;
            }

            saveToken(res.access_token);

            window.location.href = "/dashboard";

        } catch (err) {

            console.error(err);
            alert("Login failed");

        } finally {

            setLoading(false);

        }
    }

    return (
        <div style={{ padding: 40 }}>

            <h2>HR Login</h2>

            <form onSubmit={handleLogin}>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <br /><br />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <br /><br />

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>

            </form>

            <br />

            <p>
                No account? <a href="/register">Register</a>
            </p>

        </div>
    );
}