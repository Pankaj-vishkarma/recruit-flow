"use client";

import CalendarGrid from "@/components/CalendarGrid";
import { CalendarDays } from "lucide-react";

export default function CandidateInterviewPage() {

    return (

        <div className="max-w-6xl mx-auto px-4 py-6 lg:py-10">

            {/* Page Header */}

            <div className="mb-8">

                <div className="flex items-center gap-3 mb-2">

                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                        <CalendarDays size={20} />
                    </div>

                    <h1 className="text-2xl font-semibold text-gray-800">
                        Schedule Interview
                    </h1>

                </div>

                <p className="text-sm text-gray-500">
                    Choose an available time slot to schedule your interview.
                </p>

            </div>


            {/* Calendar Container */}

            <div className="bg-white border rounded-xl shadow-sm hover:shadow-md transition duration-200 p-4 sm:p-6">

                <CalendarGrid />

            </div>

        </div>

    );
}