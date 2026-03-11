import { useState } from "react";
import { sendMessage } from "../lib/api";

export default function useChat() {

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const send = async (text) => {

        if (!text || loading) return;

        setError(null);

        const userMsg = {
            role: "user",
            text
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
                text: reply
            };

            setMessages(prev => [...prev, botMsg]);

        } catch (err) {

            console.error(err);

            setError("Failed to get response from server.");

            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    text: "⚠️ Error communicating with server."
                }
            ]);

        } finally {

            setLoading(false);
        }
    };

    const resetChat = () => {
        setMessages([]);
        setError(null);
    };

    return {
        messages,
        send,
        loading,
        error,
        resetChat
    };
}