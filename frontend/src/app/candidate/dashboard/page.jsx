"use client";

import { useEffect, useState } from "react";
import { getCandidateDashboard } from "@/lib/api";

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
        return <div>Loading dashboard...</div>;
    }

    if (error) {
        return <div style={{ color: "red" }}>{error}</div>;
    }

    if (!data) {
        return <div>No dashboard data available</div>;
    }

    const currentStageIndex = stages.includes(data?.status)
        ? stages.indexOf(data.status)
        : 0;

    return (

        <div style={{ padding: "40px" }}>

            <h2>Candidate Dashboard</h2>

            {/* Pipeline Progress */}

            <div style={{ marginTop: "30px" }}>

                <h3>Recruitment Progress</h3>

                <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>

                    {stages.map((stage, index) => {

                        const completed = index <= currentStageIndex;

                        return (

                            <div
                                key={stage}
                                style={{
                                    padding: "10px 15px",
                                    borderRadius: "8px",
                                    background: completed ? "#4CAF50" : "#ccc",
                                    color: "white"
                                }}
                            >
                                {stage}
                            </div>

                        );

                    })}

                </div>

            </div>


            {/* Interview Status */}

            <div style={{ marginTop: "40px" }}>

                <h3>Interview Status</h3>

                {data?.scheduled_time ? (
                    <div style={{
                        padding: "10px",
                        background: "#e3f2fd",
                        borderRadius: "6px"
                    }}>
                        📅 Interview Scheduled: {data.scheduled_time}
                    </div>
                ) : (
                    <div style={{
                        padding: "10px",
                        background: "#fff3cd",
                        borderRadius: "6px"
                    }}>
                        ⏳ Interview not scheduled yet
                    </div>
                )}

            </div>

            {/* Resume Upload */}

            <h3>Upload Resume</h3>

            <input
                type="file"
                accept=".pdf"
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


            {/* Candidate Info */}

            <div style={{ marginTop: "40px" }}>

                <h3>Name</h3>
                <p>{data?.name || "Not available"}</p>

                <h3>Email</h3>
                <p>{data?.email || "Not available"}</p>

                <h3>Interview Score</h3>
                <p>{data?.interview_score ?? "Not evaluated yet"}</p>

                <h3>Skills</h3>
                <p>
                    {Array.isArray(data?.skills) && data.skills.length > 0
                        ? data.skills.join(", ")
                        : "Not added"}
                </p>

                <h3>Experience</h3>
                <p>{data?.experience ?? "Not added"}</p>

            </div>

        </div>
    );
}