"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import ChatBox from "@/components/ChatBox";

export default function ChatPage() {

    const router = useRouter();

    useEffect(() => {

        if (!isAuthenticated()) {
            router.push("/login");
        }

    }, [router]);

    return (

        <div className="space-y-6">

            {/* Page Header */}

            <div className="text-center">

                <h1 className="text-2xl font-semibold text-white">
                    Recruit-Flow AI Interview Assistant
                </h1>

                <p className="text-sm text-gray-400 mt-2">
                    Chat with the automated HR assistant to start your screening process
                </p>

            </div>


            {/* Chat Component */}

            <ChatBox />

        </div>

    );

}