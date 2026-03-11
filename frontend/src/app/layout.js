"use client";

import "./globals.css";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { isAuthenticated } from "@/lib/auth";

export default function RootLayout({ children }) {

  const [ready, setReady] = useState(false);

  useEffect(() => {

    const path = window.location.pathname;

    const publicRoutes = ["/login", "/register", "/chat"];

    if (!publicRoutes.includes(path) && !isAuthenticated()) {

      window.location.href = "/login";

    } else {

      setReady(true);

    }

  }, []);

  if (!ready) return null;

  return (
    <html lang="en">
      <body>

        {/* Top Navbar */}
        <Navbar />

        {/* Main Dashboard Layout */}

        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            background: "#f5f7fb"
          }}
        >

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

            <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>
              Recruit Flow
            </h2>

            <a href="/dashboard" style={linkStyle}>
              Dashboard
            </a>

            <a href="/candidates" style={linkStyle}>
              Candidates
            </a>

            <a href="/calendar" style={linkStyle}>
              Calendar
            </a>

            <a href="/chat" style={linkStyle}>
              Chat
            </a>

          </aside>



          {/* Page Content */}

          <main
            style={{
              flex: 1,
              padding: "30px"
            }}
          >

            {children}

          </main>

        </div>

      </body>
    </html>
  );
}

const linkStyle = {
  color: "#e5e7eb",
  textDecoration: "none",
  fontSize: "14px"
};