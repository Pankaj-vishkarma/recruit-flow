"use client";

import ChatBox from "../../components/ChatBox";

export default function ChatPage() {

    return (

        <div
            style={{
                minHeight: "100vh",
                background: "#f3f4f6",
                padding: "40px 20px"
            }}
        >

            <div
                style={{
                    maxWidth: "900px",
                    margin: "auto",
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

            {/* Chat container */}

            <ChatBox />

        </div>

    );
}