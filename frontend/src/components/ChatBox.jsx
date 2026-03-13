"use client";

import { useState, useRef, useEffect } from "react";
import { sendMessage } from "@/lib/api";
import MessageBubble from "./MessageBubble";
import { Bot, SendHorizonal } from "lucide-react";

export default function ChatBox() {

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const bottomRef = useRef(null);
    const textareaRef = useRef(null);

    /* Load chat history */

    useEffect(() => {
        const saved = localStorage.getItem("chat_history");
        if (saved) {
            setMessages(JSON.parse(saved));
        }
    }, []);

    /* Save chat history */

    useEffect(() => {
        localStorage.setItem("chat_history", JSON.stringify(messages));
    }, [messages]);

    /* Auto Scroll */

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    /* Auto Resize Textarea */

    useEffect(() => {

        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height =
                textareaRef.current.scrollHeight + "px";
        }

    }, [input]);

    /* Send Message */

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

            let responseText = "";

            if (typeof res?.data === "object") {

                responseText = Object.entries(res.data)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join("\n");

            } else {

                responseText = res?.data || res?.message || "No response from system";

            }

            const botMessage = {
                role: "assistant",
                text: responseText,
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

    /* Enter key */

    const handleKeyPress = (e) => {

        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }

    };

    return (

        <div className="flex flex-col h-[80vh] bg-white rounded-xl shadow-sm border overflow-hidden">

            {/* Header */}

            <div className="px-6 py-4 border-b bg-gray-50 flex items-center gap-2 font-semibold text-gray-800">

                <Bot size={18} className="text-blue-600" />

                RecruitFlow AI Assistant

            </div>


            {/* Messages */}

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">

                {messages.length === 0 && (

                    <div className="text-center text-gray-500 mt-10">

                        <div className="flex justify-center mb-3">
                            <Bot size={28} className="text-gray-400" />
                        </div>

                        Start a conversation with the HR assistant

                    </div>

                )}

                {messages.map((msg, i) => (
                    <MessageBubble key={i} message={msg} />
                ))}

                {loading && (

                    <div className="flex items-center gap-2 text-gray-500 italic">

                        <Bot size={16} />

                        AI is thinking...

                    </div>

                )}

                <div ref={bottomRef} />

            </div>


            {/* Error */}

            {error && (
                <div className="text-red-500 text-sm px-6 py-2">
                    {error}
                </div>
            )}


            {/* Input */}

            <div className="flex gap-3 p-4 border-t bg-white">

                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask something about the candidate..."
                    rows={1}
                    className="
                    flex-1
                    resize-none
                    border
                    rounded-lg
                    px-4 py-2
                    text-sm
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                    transition
                    "
                />

                <button
                    onClick={handleSend}
                    disabled={loading}
                    className="
                    flex items-center gap-2
                    px-5 py-2
                    rounded-lg
                    bg-blue-600
                    text-white
                    text-sm
                    font-medium
                    hover:bg-blue-700
                    transition
                    disabled:bg-gray-400
                    "
                >

                    {loading ? "Sending..." : "Send"}

                    {!loading && <SendHorizonal size={16} />}

                </button>

            </div>

        </div>

    );
}