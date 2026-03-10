import { useState } from "react";
import { sendMessage } from "../lib/api";

export default function useChat() {
    const [messages, setMessages] = useState([]);

    const send = async (text) => {
        const userMsg = { role: "user", text };

        setMessages((prev) => [...prev, userMsg]);

        const res = await sendMessage(text);

        const botMsg = { role: "assistant", text: res.reply };

        setMessages((prev) => [...prev, botMsg]);
    };

    return { messages, send };
}