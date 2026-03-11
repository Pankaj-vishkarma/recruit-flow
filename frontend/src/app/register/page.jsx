"use client";

import { useState } from "react";
import { registerUser } from "@/lib/api";

export default function RegisterPage() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleRegister(e) {

        e.preventDefault();

        if (!name || !email || !password) {
            alert("All fields required");
            return;
        }

        try {

            setLoading(true);

            const res = await registerUser(name, email, password);

            if (res.status === "error") {
                alert(res.message || "Registration failed");
                return;
            }

            alert("Account created successfully");

            window.location.href = "/login";

        } catch (err) {

            console.error(err);
            alert("Registration failed");

        } finally {

            setLoading(false);

        }
    }

    return (
        <div style={{ padding: 40 }}>

            <h2>HR Register</h2>

            <form onSubmit={handleRegister}>

                <input
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <br /><br />

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
                    {loading ? "Registering..." : "Register"}
                </button>

            </form>

            <br />

            <p>
                Already have account? <a href="/login">Login</a>
            </p>

        </div>
    );
}