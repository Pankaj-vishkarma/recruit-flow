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
        try {
            const saved = localStorage.getItem("chat_history");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setMessages(parsed);
                }
            }
        } catch {
            localStorage.removeItem("chat_history");
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



    /* ----------------------------- */
    /* FORMAT AI RESPONSE */
    /* ----------------------------- */

    function formatAIResponse(data) {

        if (!data) return "No response from system";

        if (typeof data === "string") return data;

        if (typeof data === "object") {

            let text = "";

            if (data.message) {
                text += data.message + "\n\n";
            }

            if (data.messages && Array.isArray(data.messages)) {

                const last = data.messages[data.messages.length - 1];

                if (last?.content) {
                    text += last.content + "\n\n";
                }
            }

            if (data.scheduled_time) {
                text += `Interview Scheduled: ${data.scheduled_time}\n`;
            }

            if (data.current_step) {
                text += `Current Step: ${data.current_step}\n`;
            }

            return text.trim();
        }

        return JSON.stringify(data, null, 2);
    }



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

            const responseText =
                res?.reply ||
                res?.data?.reply ||
                res?.message ||
                "No response from AI";

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

        <div className="glass flex flex-col h-[80vh] rounded-xl overflow-hidden border border-white/10">

            {/* Header */}

            <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2 font-semibold text-white">

                <Bot size={18} className="text-indigo-400" />

                RecruitFlow AI Assistant

            </div>



            {/* Messages */}

            <div className="flex-1 overflow-y-auto p-6 space-y-4">

                {messages.length === 0 && (

                    <div className="text-center text-gray-400 mt-10">

                        <div className="flex justify-center mb-3">
                            <Bot size={28} className="text-gray-500" />
                        </div>

                        Start a conversation with the HR assistant

                    </div>

                )}

                {messages.map((msg, i) => (
                    <MessageBubble key={i} message={msg} />
                ))}

                {loading && (

                    <div className="flex items-center gap-2 text-gray-400 italic">

                        <Bot size={16} />

                        AI is thinking...

                    </div>

                )}

                <div ref={bottomRef} />

            </div>



            {/* Error */}

            {error && (
                <div className="text-red-400 text-sm px-6 py-2">
                    {error}
                </div>
            )}



            {/* Input */}

            <div className="flex gap-3 p-4 border-t border-white/10">

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
                    bg-white/5
                    border border-white/10
                    rounded-lg
                    px-4 py-2
                    text-sm
                    text-white
                    placeholder-gray-400
                    focus:outline-none
                    focus:ring-2
                    focus:ring-indigo-500
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
                    bg-indigo-600
                    text-white
                    text-sm
                    font-medium
                    hover:bg-indigo-700
                    transition
                    disabled:bg-gray-600
                    "
                >

                    {loading ? "Sending..." : "Send"}

                    {!loading && <SendHorizonal size={16} />}

                </button>

            </div>

        </div>

    );
}