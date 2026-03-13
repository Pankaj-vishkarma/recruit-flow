"use client";

import { CheckCircle, Briefcase } from "lucide-react";

export default function CandidateStatusPage() {

    return (

        <div className="max-w-4xl mx-auto px-4 py-6 lg:py-10">

            {/* Header */}

            <div className="mb-8">

                <div className="flex items-center gap-3 mb-2">

                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                        <Briefcase size={20} />
                    </div>

                    <h1 className="text-2xl font-semibold text-gray-800">
                        Application Status
                    </h1>

                </div>

                <p className="text-sm text-gray-500">
                    Track your recruitment progress through each stage.
                </p>

            </div>


            {/* Status Card */}

            <div className="bg-white border rounded-xl shadow-sm hover:shadow-md transition duration-200 p-6">

                <p className="text-gray-600 mb-6">
                    Your recruitment progress will appear here.
                </p>

                <div className="flex flex-wrap gap-3">

                    <StatusBadge label="Applied" active />

                    <StatusBadge label="Screening" />

                    <StatusBadge label="Technical Interview" />

                    <StatusBadge label="Final Interview" />

                    <StatusBadge label="Selected" />

                </div>

            </div>

        </div>

    );
}


function StatusBadge({ label, active }) {

    return (

        <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition
            ${active
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
        >

            {active && <CheckCircle size={14} />}

            {label}

        </div>

    );

}