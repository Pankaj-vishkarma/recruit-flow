"use client";

import { useState, useRef, useEffect } from "react";
import { sendMessage } from "@/lib/api";
import MessageBubble from "./MessageBubble";

export default function ChatBox() {

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const bottomRef = useRef(null);
    const textareaRef = useRef(null);



    /* --------------------------- */
    /* Load chat history */
    /* --------------------------- */

    useEffect(() => {

        const saved = localStorage.getItem("chat_history");

        if (saved) {
            setMessages(JSON.parse(saved));
        }

    }, []);



    /* --------------------------- */
    /* Save chat history */
    /* --------------------------- */

    useEffect(() => {

        localStorage.setItem("chat_history", JSON.stringify(messages));

    }, [messages]);



    /* --------------------------- */
    /* Auto Scroll */
    /* --------------------------- */

    useEffect(() => {

        bottomRef.current?.scrollIntoView({ behavior: "smooth" });

    }, [messages, loading]);



    /* --------------------------- */
    /* Auto Resize Textarea */
    /* --------------------------- */

    useEffect(() => {

        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height =
                textareaRef.current.scrollHeight + "px";
        }

    }, [input]);



    /* --------------------------- */
    /* Send Message */
    /* --------------------------- */

    const handleSend = async () => {

        if (!input.trim() || loading) return;

        setError(null);

        const userMessage = {
            role: "user",
            text: input,
            time: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, userMessage]);

        const messageToSend = input;

        setInput("");
        setLoading(true);

        try {

            const res = await sendMessage(messageToSend);

            const botMessage = {
                role: "assistant",
                text:
                    res?.data
                        ? JSON.stringify(res.data, null, 2)
                        : res?.message || "No response from system",
                time: new Date().toLocaleTimeString()
            };

            setMessages(prev => [...prev, botMessage]);

        } catch (err) {

            console.error(err);

            setError("Failed to communicate with server.");

        } finally {

            setLoading(false);
        }
    };



    /* --------------------------- */
    /* Enter key support */
    /* --------------------------- */

    const handleKeyPress = (e) => {

        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };



    return (

        <div
            style={{
                maxWidth: "900px",
                margin: "auto",
                display: "flex",
                flexDirection: "column",
                height: "90vh",
                borderRadius: "12px",
                background: "#ffffff",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                overflow: "hidden"
            }}
        >

            {/* Chat Header */}

            <div
                style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid #eee",
                    fontWeight: "600",
                    background: "#f9fafb"
                }}
            >
                RecruitFlow AI Assistant
            </div>



            {/* Chat Messages */}

            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "20px",
                    background: "#f8fafc"
                }}
            >

                {messages.length === 0 && (
                    <div
                        style={{
                            textAlign: "center",
                            color: "#888",
                            marginTop: "40px"
                        }}
                    >
                        Start a conversation with the HR assistant
                    </div>
                )}

                {messages.map((msg, i) => (
                    <MessageBubble key={i} message={msg} />
                ))}

                {loading && (
                    <div
                        style={{
                            color: "#666",
                            padding: "10px",
                            fontStyle: "italic"
                        }}
                    >
                        AI is thinking...
                    </div>
                )}

                <div ref={bottomRef} />

            </div>



            {/* Error Message */}

            {error && (
                <div
                    style={{
                        color: "red",
                        padding: "10px 20px",
                        fontSize: "14px"
                    }}
                >
                    {error}
                </div>
            )}



            {/* Input Area */}

            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    padding: "15px",
                    borderTop: "1px solid #eee",
                    background: "#fff"
                }}
            >

                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask something about the candidate..."
                    rows={1}
                    style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        outline: "none",
                        resize: "none",
                        fontSize: "14px"
                    }}
                />

                <button
                    onClick={handleSend}
                    disabled={loading}
                    style={{
                        padding: "12px 20px",
                        borderRadius: "8px",
                        border: "none",
                        background: loading ? "#aaa" : "#2563eb",
                        color: "#fff",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontWeight: "500"
                    }}
                >
                    {loading ? "Sending..." : "Send"}
                </button>

            </div>

        </div>
    );
}