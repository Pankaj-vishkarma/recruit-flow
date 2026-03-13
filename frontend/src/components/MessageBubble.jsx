import { User, Bot } from "lucide-react";

export default function MessageBubble({ message }) {

    const isUser = message?.role === "user";

    return (

        <div
            className={`flex w-full mb-4 items-end gap-2 
            ${isUser ? "justify-end" : "justify-start"}
            `}
        >

            {/* AI Avatar */}

            {!isUser && (

                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 border border-white/10 flex items-center justify-center">

                    <Bot size={16} className="text-indigo-400" />

                </div>

            )}


            <div
                className={`flex flex-col max-w-[80%] 
                ${isUser ? "items-end" : "items-start"}
                `}
            >

                {/* Sender */}

                <span className="text-xs text-gray-400 mb-1 flex items-center gap-1">

                    {isUser ? (
                        <>
                            <User size={12} />
                            You
                        </>
                    ) : (
                        <>
                            <Bot size={12} />
                            AI Assistant
                        </>
                    )}

                </span>


                {/* Bubble */}

                <div
                    className={`
                    px-4 py-2
                    rounded-2xl
                    text-sm
                    whitespace-pre-wrap
                    break-words
                    transition
                    ${isUser
                            ? "bg-indigo-600 text-white rounded-tr-sm"
                            : "bg-white/5 backdrop-blur border border-white/10 text-gray-200 rounded-tl-sm"
                        }
                    `}
                >

                    {typeof message.text === "string"
                        ? message.text
                        : JSON.stringify(message.text, null, 2)}

                </div>


                {/* Time */}

                {message?.time && (

                    <span className="text-[10px] text-gray-500 mt-1">
                        {message.time}
                    </span>

                )}

            </div>


            {/* User Avatar */}

            {isUser && (

                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">

                    <User size={16} className="text-white" />

                </div>

            )}

        </div>

    );
}