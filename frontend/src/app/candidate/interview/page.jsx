"use client";

import CalendarGrid from "@/components/CalendarGrid";
import { CalendarDays } from "lucide-react";

export default function CandidateInterviewPage() {

    return (

        <div className="flex flex-col h-full max-w-6xl mx-auto px-4 py-6 lg:py-8">

            {/* Page Header */}

            <div className="mb-6">

                <div className="flex items-center gap-3 mb-2">

                    <div className="bg-indigo-600/20 text-indigo-400 p-2 rounded-lg">
                        <CalendarDays size={20} />
                    </div>

                    <h1 className="text-2xl font-semibold text-white">
                        Schedule Interview
                    </h1>

                </div>

                <p className="text-sm text-gray-400">
                    Choose an available time slot to schedule your interview.
                </p>

            </div>


            {/* Calendar */}

            <div className="flex-1 min-h-0">

                <CalendarGrid />

            </div>

        </div>

    );

}