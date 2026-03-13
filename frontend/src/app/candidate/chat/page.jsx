"use client";

import ChatBox from "@/components/ChatBox";
import { MessageSquare } from "lucide-react";

export default function CandidateChatPage() {

    return (

        <div className="flex flex-col h-full max-w-6xl mx-auto px-4 py-6 lg:py-8">

            {/* Page Header */}

            <div className="mb-6">

                <div className="flex items-center gap-3 mb-2">

                    <div className="bg-indigo-600/20 text-indigo-400 p-2 rounded-lg">
                        <MessageSquare size={20} />
                    </div>

                    <h1 className="text-2xl font-semibold text-white">
                        AI Interview Chat
                    </h1>

                </div>

                <p className="text-sm text-gray-400">
                    Practice your interview with our AI interviewer.
                    Answer questions and receive instant feedback.
                </p>

            </div>


            {/* Chat */}

            <div className="flex-1 min-h-0">

                <ChatBox />

            </div>

        </div>

    );

}