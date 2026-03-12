"use client";

import Link from "next/link";

export default function CandidateLayout({ children }) {

    return (

        <div style={{ display: "flex", minHeight: "100vh" }}>

            {/* Sidebar */}

            <aside
                style={{
                    width: "220px",
                    background: "#111827",
                    color: "#fff",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px"
                }}
            >

                <h2 style={{ marginBottom: "10px" }}>
                    Candidate Panel
                </h2>

                <Link href="/candidate/dashboard" style={linkStyle}>
                    Dashboard
                </Link>

                <Link href="/candidate/chat" style={linkStyle}>
                    AI Interview Chat
                </Link>

                <Link href="/candidate/interview" style={linkStyle}>
                    Schedule Interview
                </Link>

                <Link href="/candidate/status" style={linkStyle}>
                    Application Status
                </Link>

                <Link href="/candidate/profile" style={linkStyle}>
                    Profile
                </Link>

            </aside>


            {/* Content */}

            <main
                style={{
                    flex: 1,
                    padding: "30px",
                    background: "#f5f7fb"
                }}
            >
                {children}
            </main>

        </div>

    );
}

const linkStyle = {
    color: "#e5e7eb",
    textDecoration: "none",
    fontSize: "14px"
};