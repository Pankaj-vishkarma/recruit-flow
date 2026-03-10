export default function MessageBubble({ message }) {
    return (
        <div
            style={{
                marginBottom: "10px",
                textAlign: message.role === "user" ? "right" : "left",
            }}
        >
            <span
                style={{
                    padding: "8px 12px",
                    background: message.role === "user" ? "#0070f3" : "#e5e5e5",
                    color: message.role === "user" ? "white" : "black",
                    borderRadius: "10px",
                }}
            >
                {message.text}
            </span>
        </div>
    );
}