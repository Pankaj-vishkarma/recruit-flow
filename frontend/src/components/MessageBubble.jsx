export default function MessageBubble({ message }) {

    const isUser = message?.role === "user";

    return (
        <div
            style={{
                display: "flex",
                justifyContent: isUser ? "flex-end" : "flex-start",
                marginBottom: "12px",
                width: "100%"
            }}
        >

            <div
                style={{
                    maxWidth: "75%",
                    padding: "10px 14px",
                    borderRadius: "14px",
                    background: isUser ? "#2563eb" : "#f1f5f9",
                    color: isUser ? "#fff" : "#111",
                    fontSize: "14px",
                    lineHeight: "1.4",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    borderTopRightRadius: isUser ? "4px" : "14px",
                    borderTopLeftRadius: isUser ? "14px" : "4px"
                }}
            >

                {typeof message.text === "string"
                    ? message.text
                    : JSON.stringify(message.text, null, 2)}

            </div>

        </div>
    );
}