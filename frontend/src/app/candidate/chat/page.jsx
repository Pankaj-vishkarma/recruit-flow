"use client";

import ChatBox from "@/components/ChatBox";
import { MessageSquare } from "lucide-react";

export default function CandidateChatPage() {

    return (

        <div className="max-w-5xl mx-auto px-4 py-6 lg:py-10">

            {/* Page Header */}

            <div className="mb-8">

                <div className="flex items-center gap-3 mb-2">

                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                        <MessageSquare size={20} />
                    </div>

                    <h1 className="text-2xl font-semibold text-gray-800">
                        AI Interview Chat
                    </h1>

                </div>

                <p className="text-sm text-gray-500">
                    Practice your interview with our AI interviewer.
                    Answer questions and receive instant feedback.
                </p>

            </div>


            {/* Chat Container */}

            <div className="bg-white border rounded-xl shadow-sm hover:shadow-md transition duration-200 p-4 sm:p-6 min-h-[500px] flex flex-col flex-1">

                <ChatBox />

            </div>

        </div>

    );
}