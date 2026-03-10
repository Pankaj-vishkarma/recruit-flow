"use client";

import Link from "next/link";

export default function Navbar() {
    return (
        <nav
            style={{
                display: "flex",
                gap: "20px",
                padding: "15px",
                background: "#111",
                color: "white",
            }}
        >
            <Link href="/">Home</Link>
            <Link href="/chat">Chat</Link>
            <Link href="/calendar">Calendar</Link>
            <Link href="/dashboard">Dashboard</Link>
        </nav>
    );
}