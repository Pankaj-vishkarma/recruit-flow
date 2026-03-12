"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {

    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Candidate Chat", path: "/chat" },
        { name: "Interview Calendar", path: "/calendar" },
        { name: "Candidates", path: "/candidates" },
    ];

    return (
        <aside
            style={{
                width: "240px",
                background: "#111827",
                color: "white",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh"
            }}
        >

            {/* App Name */}

            <h2
                style={{
                    marginBottom: "30px",
                    fontSize: "20px",
                    fontWeight: "600"
                }}
            >
                RecruitFlow
            </h2>



            {/* Navigation */}

            <nav
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                }}
            >

                {navItems.map((item) => {

                    const active = pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            style={{
                                padding: "10px 12px",
                                borderRadius: "6px",
                                textDecoration: "none",
                                color: active ? "#fff" : "#d1d5db",
                                background: active ? "#1f2937" : "transparent",
                                fontSize: "14px",
                                fontWeight: "500"
                            }}
                        >
                            {item.name}
                        </Link>
                    );
                })}

            </nav>

        </aside>
    );
}