import { useState, useEffect } from "react";
import { sendMessage } from "@/lib/api";

export default function useChat() {

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);



    /* -------------------------------- */
    /* Load chat history */
    /* -------------------------------- */

    useEffect(() => {

        if (typeof window === "undefined") return;

        const saved = localStorage.getItem("chat_history");

        if (saved) {
            setMessages(JSON.parse(saved));
        }

    }, []);



    /* -------------------------------- */
    /* Save chat history */
    /* -------------------------------- */

    useEffect(() => {

        if (typeof window === "undefined") return;

        localStorage.setItem("chat_history", JSON.stringify(messages));

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

        setMessages(prev => [...prev, userMsg]);

        setLoading(true);

        try {

            const res = await sendMessage(text);

            const reply =
                res?.data
                    ? JSON.stringify(res.data, null, 2)
                    : res?.message || "No response received.";

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
            localStorage.removeItem("chat_history");
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