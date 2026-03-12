"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout, isAuthenticated } from "@/lib/auth";

export default function Navbar() {

    const router = useRouter();

    const auth = isAuthenticated();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <nav
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 24px",
                background: "#ffffff",
                borderBottom: "1px solid #e5e7eb",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
            }}
        >

            {/* App Title */}

            <div
                style={{
                    fontWeight: "600",
                    fontSize: "18px"
                }}
            >
                Recruit Flow
            </div>



            {/* Navigation Links */}

            <div
                style={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "center"
                }}
            >

                <Link href="/dashboard" style={linkStyle}>
                    Dashboard
                </Link>

                <Link href="/candidates" style={linkStyle}>
                    Candidates
                </Link>

                <Link href="/calendar" style={linkStyle}>
                    Calendar
                </Link>

                <Link href="/chat" style={linkStyle}>
                    Chat
                </Link>

            </div>



            {/* Auth Section */}

            <div>

                {auth ? (

                    <button
                        onClick={handleLogout}
                        style={logoutBtn}
                    >
                        Logout
                    </button>

                ) : (

                    <div style={{ display: "flex", gap: "15px" }}>

                        <Link href="/login" style={linkStyle}>
                            Login
                        </Link>

                        <Link href="/register" style={linkStyle}>
                            Register
                        </Link>

                    </div>

                )}

            </div>

        </nav>
    );
}



const linkStyle = {
    textDecoration: "none",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "500"
};

const logoutBtn = {
    padding: "8px 14px",
    border: "none",
    borderRadius: "6px",
    background: "#ef4444",
    color: "#fff",
    cursor: "pointer",
    fontSize: "13px"
};