"use client";

import { useEffect, useState } from "react";
import { getCandidateDashboard } from "@/lib/api";
import {
    Briefcase,
    Trophy,
    User,
    Brain,
    CalendarDays,
    Upload
} from "lucide-react";

export default function CandidateDashboard() {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const stages = [
        "applied",
        "screening",
        "technical",
        "interview",
        "selected"
    ];

    useEffect(() => {

        const controller = new AbortController();

        loadDashboard();

        return () => controller.abort();

    }, []);

    const loadDashboard = async () => {

        try {

            const res = await getCandidateDashboard();

            if (!res || res.status !== "success") {
                throw new Error(res?.message || "Dashboard API failed");
            }

            if (!res.data || typeof res.data !== "object") {
                throw new Error("Invalid dashboard response");
            }

            setData(res.data);

        } catch (err) {

            console.error("Dashboard error:", err);
            setError("Failed to load dashboard");

        } finally {

            setLoading(false);

        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh] text-gray-500">
                Loading dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500">
                {error}
            </div>
        );
    }

    if (!data) {
        return <div>No dashboard data available</div>;
    }

    const currentStageIndex = stages.includes(data?.status)
        ? stages.indexOf(data.status)
        : 0;

    return (

        <div className="space-y-10">

            <h1 className="text-2xl font-semibold text-gray-800">
                Candidate Dashboard
            </h1>


            {/* Stats Cards */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                <StatCard
                    icon={<Briefcase size={20} />}
                    title="Current Stage"
                    value={data?.status || "Applied"}
                />

                <StatCard
                    icon={<Trophy size={20} />}
                    title="Interview Score"
                    value={data?.interview_score ?? "Not evaluated"}
                />

                <StatCard
                    icon={<User size={20} />}
                    title="Experience"
                    value={data?.experience ?? "Not added"}
                />

                <StatCard
                    icon={<Brain size={20} />}
                    title="Skills"
                    value={Array.isArray(data?.skills) ? data.skills.length : 0}
                />

            </div>


            {/* Recruitment Progress */}

            <div className="bg-white rounded-xl shadow-sm border p-6 transition hover:shadow-md">

                <h3 className="text-lg font-semibold mb-6 text-gray-800">
                    Recruitment Progress
                </h3>

                <div className="flex flex-wrap gap-3">

                    {stages.map((stage, index) => {

                        const completed = index <= currentStageIndex;

                        return (

                            <div
                                key={stage}
                                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition
                                ${completed
                                        ? "bg-green-500 text-white shadow"
                                        : "bg-gray-200 text-gray-600"
                                    }`}
                            >
                                {stage}
                            </div>

                        );

                    })}

                </div>

            </div>


            {/* Interview + Resume */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


                {/* Interview Status */}

                <div className="bg-white rounded-xl shadow-sm border p-6 transition hover:shadow-md">

                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                        <CalendarDays size={18} />
                        Interview Status
                    </h3>

                    {data?.scheduled_time ? (

                        <div className="bg-blue-50 text-blue-700 p-4 rounded-lg transition">

                            📅 Interview Scheduled: {data.scheduled_time}

                        </div>

                    ) : (

                        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">

                            ⏳ Interview not scheduled yet

                        </div>

                    )}

                </div>


                {/* Resume Upload */}

                <div className="bg-white rounded-xl shadow-sm border p-6 transition hover:shadow-md">

                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                        <Upload size={18} />
                        Upload Resume
                    </h3>

                    <input
                        type="file"
                        accept=".pdf"
                        className="border p-2 rounded-lg w-full cursor-pointer hover:border-gray-400 transition"
                        onChange={async (e) => {

                            const file = e.target.files[0];

                            if (!file) return;

                            const formData = new FormData();
                            formData.append("file", file);

                            const token = localStorage.getItem("token");

                            const res = await fetch(
                                `${process.env.NEXT_PUBLIC_API_URL}/candidate/upload-resume`,
                                {
                                    method: "POST",
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                    body: formData,
                                }
                            );

                            const data = await res.json();

                            if (data.status === "success") {
                                alert("Resume uploaded successfully");
                                window.location.reload();
                            }

                        }}
                    />

                </div>

            </div>


            {/* Candidate Info */}

            <div className="bg-white rounded-xl shadow-sm border p-6 transition hover:shadow-md">

                <h3 className="text-lg font-semibold mb-6 text-gray-800">
                    Candidate Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <Info label="Name" value={data?.name} />
                    <Info label="Email" value={data?.email} />
                    <Info label="Interview Score" value={data?.interview_score ?? "Not evaluated"} />
                    <Info label="Experience" value={data?.experience ?? "Not added"} />

                    <div>

                        <p className="text-sm text-gray-500 mb-2">
                            Skills
                        </p>

                        <div className="flex flex-wrap gap-2">

                            {Array.isArray(data?.skills) && data.skills.length > 0 ? (
                                data.skills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm transition hover:bg-blue-200"
                                    >
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <p className="text-gray-500">
                                    Not added
                                </p>
                            )}

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );
}


/* Stat Card */

function StatCard({ icon, title, value }) {

    return (
        <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition group">

            <div className="flex items-center justify-between mb-3">

                <div className="text-gray-500 group-hover:text-blue-600 transition">
                    {icon}
                </div>

            </div>

            <p className="text-sm text-gray-500 mb-1">
                {title}
            </p>

            <p className="text-xl font-semibold text-gray-800">
                {value}
            </p>

        </div>
    );

}


/* Info Row */

function Info({ label, value }) {

    return (
        <div>

            <p className="text-sm text-gray-500 mb-1">
                {label}
            </p>

            <p className="font-medium text-gray-800">
                {value || "Not available"}
            </p>

        </div>
    );

}