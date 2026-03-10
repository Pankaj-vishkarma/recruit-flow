"use client";

import { useState } from "react";
import { sendMessage } from "../lib/api";
import MessageBubble from "./MessageBubble";

export default function ChatBox() {

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const handleSend = async () => {

        if (!input) return;

        const userMessage = {
            role: "user",
            text: input
        };

        setMessages(prev => [...prev, userMessage]);

        const res = await sendMessage(input);

        const botMessage = {
            role: "assistant",
            text: JSON.stringify(res)
        };

        setMessages(prev => [...prev, botMessage]);

        setInput("");
    };

    return (
        <div>

            <div style={{ marginBottom: 20 }}>

                {messages.map((msg, i) => (
                    <MessageBubble key={i} message={msg} />
                ))}

            </div>

            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something..."
            />

            <button onClick={handleSend}>
                Send
            </button>

        </div>
    );
}