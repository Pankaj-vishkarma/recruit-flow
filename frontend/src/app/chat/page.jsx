"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import ChatBox from "@/components/ChatBox";

export default function ChatPage() {

    const router = useRouter();

    useEffect(() => {

        if (!isAuthenticated()) {
            router.push("/login");
        }

    }, [router]);


    return (

        <div
            style={{
                minHeight: "100vh",
                background: "#f3f4f6",
                padding: "40px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
            }}
        >

            {/* Page Header */}

            <div
                style={{
                    maxWidth: "900px",
                    width: "100%",
                    textAlign: "center",
                    marginBottom: "30px"
                }}
            >

                <h1
                    style={{
                        fontSize: "28px",
                        fontWeight: "600",
                        marginBottom: "8px"
                    }}
                >
                    Recruit-Flow AI Interview Assistant
                </h1>

                <p
                    style={{
                        color: "#666",
                        fontSize: "14px"
                    }}
                >
                    Chat with the automated HR assistant to start your screening process
                </p>

            </div>


            {/* Chat Container */}

            <div
                style={{
                    width: "100%",
                    maxWidth: "900px"
                }}
            >

                <ChatBox />

            </div>

        </div>

    );
}