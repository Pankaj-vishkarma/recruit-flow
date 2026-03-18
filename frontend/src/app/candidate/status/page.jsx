"use client";

import { CheckCircle, Briefcase } from "lucide-react";
import { useEffect, useState } from "react";
import { getCandidateDashboard } from "@/lib/api";

export default function CandidateStatusPage() {

    const [status, setStatus] = useState("applied");

    useEffect(() => {
        async function fetchStatus() {
            const res = await getCandidateDashboard();

            if (res?.data) {
                const dbStatus = res.data.status || "applied";
                setStatus(mapStatus(dbStatus));
            }
        }

        fetchStatus();
    }, []);

    // 🔥 STATUS MAPPING
    function mapStatus(dbStatus) {
        if (dbStatus === "shortlisted") return "technical";
        if (dbStatus === "rejected") return "rejected";
        return dbStatus;
    }

    // 🔥 STEP CONFIG
    const steps = [
        { key: "applied", label: "Applied" },
        { key: "screening", label: "Screening" },
        { key: "technical", label: "Technical Interview" },
        { key: "final", label: "Final Interview" },
        { key: "selected", label: "Selected" },
        { key: "rejected", label: "Rejected" }
    ];

    const currentIndex = steps.findIndex(s => s.key === status);

    return (

        <div className="max-w-4xl mx-auto px-4 py-6 lg:py-10">

            {/* Header */}

            <div className="mb-8">

                <div className="flex items-center gap-3 mb-2">

                    <div className="bg-indigo-600/20 text-indigo-400 p-2 rounded-lg">
                        <Briefcase size={20} />
                    </div>

                    <h1 className="text-2xl font-semibold text-white">
                        Application Status
                    </h1>

                </div>

                <p className="text-sm text-gray-400">
                    Track your recruitment progress through each stage.
                </p>

            </div>


            {/* Status Card */}

            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl hover:shadow-lg transition duration-200 p-6">

                <p className="text-gray-400 mb-6">
                    Your recruitment progress will appear here.
                </p>

                <div className="flex flex-wrap gap-3">

                    {steps.map((step, index) => {

                        const isActive =
                            status === "rejected"
                                ? step.key === "rejected"
                                : index <= currentIndex;

                        return (
                            <StatusBadge
                                key={step.key}
                                label={step.label}
                                active={isActive}
                                status={status} // 🔥 ADDED
                            />
                        );
                    })}

                </div>

            </div>

        </div>

    );
}


function StatusBadge({ label, active, status }) {

    const isRejected = status === "rejected" && label === "Rejected";

    return (

        <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition
            ${active
                    ? isRejected
                        ? "bg-red-500 text-white"     // 🔥 RED
                        : "bg-green-500 text-white"  // ✅ GREEN
                    : "bg-gray-800 text-gray-300"
                }`}
        >

            {active && <CheckCircle size={14} />}

            {label}

        </div>

    );

}