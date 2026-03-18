import { useState, useEffect } from "react";
import { sendMessage } from "@/lib/api";

export default function useChat() {

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getChatKey = () => {
        const email = localStorage.getItem("user_email");
        return email ? `chat_history_${email}` : "chat_history_guest";
    };


    /* -------------------------------- */
    /* Load chat history */
    /* -------------------------------- */
    useEffect(() => {
        if (typeof window === "undefined") return;

        const key = getChatKey();
        const saved = localStorage.getItem(key);

        if (saved) {
            try {
                setMessages(JSON.parse(saved));
            } catch {
                setMessages([]);
            }
        }
    }, []);


    /* -------------------------------- */
    /* Save chat history */
    /* -------------------------------- */
    useEffect(() => {
        if (typeof window === "undefined") return;

        const key = getChatKey();
        localStorage.setItem(key, JSON.stringify(messages));
    }, [messages]);


    /* -------------------------------- */
    /* Send message */
    /* -------------------------------- */
    const send = async (text) => {

        if (!text || loading) return;

        setError(null);

        const userMsg = {
            role: "user",
            text,
            time: new Date().toLocaleTimeString()
        };

        // ✅ Step 1: Update messages
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);


        setLoading(true);

        try {

            // ✅ Step 3: Send formatted history
            const res = await sendMessage(text);

            console.log("API RESPONSE FULL:", res);

            let reply = "No response received.";

            if (res?.status === "success" || res?.success) {
                reply =
                    res?.reply ||                 // 🔥 main backend field
                    res?.data?.reply ||
                    res?.message ||
                    "No response from AI";
            } else {
                reply = res?.message || "Server error";
            }

            const botMsg = {
                role: "assistant",
                text: reply,
                time: new Date().toLocaleTimeString()
            };

            setMessages(prev => [...prev, botMsg]);

        } catch (err) {

            console.error(err);

            setError("Failed to get response from server.");

            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    text: "⚠️ Error communicating with server.",
                    time: new Date().toLocaleTimeString()
                }
            ]);

        } finally {
            setLoading(false);
        }
    };

    /* -------------------------------- */
    /* Reset chat */
    /* -------------------------------- */
    const resetChat = () => {

        setMessages([]);
        setError(null);

        if (typeof window !== "undefined") {
            const key = getChatKey();
            localStorage.removeItem(key);
        }
    };


    return {
        messages,
        send,
        loading,
        error,
        resetChat
    };
}