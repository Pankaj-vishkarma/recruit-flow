"use client";

import Link from "next/link";

export default function Sidebar() {
    return (
        <div
            style={{
                width: "240px",
                background: "#111827",
                color: "white",
                padding: "20px",
            }}
        >
            <h2 style={{ marginBottom: "30px" }}>RecruitFlow</h2>

            <nav style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <Link href="/dashboard" style={{ color: "white", textDecoration: "none" }}>
                    Dashboard
                </Link>

                <Link href="/chat" style={{ color: "white", textDecoration: "none" }}>
                    Candidate Chat
                </Link>

                <Link href="/calendar" style={{ color: "white", textDecoration: "none" }}>
                    Interview Calendar
                </Link>

                <Link href="/candidates" style={{ color: "white", textDecoration: "none" }}>
                    Candidates
                </Link>
            </nav>
        </div>
    );
}