"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardPage() {

    const [stats, setStats] = useState(null);
    const [pipeline, setPipeline] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {

        async function fetchDashboard() {

            try {

                const token =
                    typeof window !== "undefined"
                        ? localStorage.getItem("token")
                        : null;

                /* ---------------------- */
                /* Fetch dashboard stats */
                /* ---------------------- */

                const statsRes = await fetch(`${API_URL}/dashboard/stats`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                });

                const statsData = await statsRes.json();

                if (statsData?.status === "error") {
                    throw new Error(statsData.message);
                }

                setStats(statsData?.data);


                /* ---------------------- */
                /* Fetch pipeline data */
                /* ---------------------- */

                const pipeRes = await fetch(`${API_URL}/dashboard/pipeline`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                });

                const pipeData = await pipeRes.json();

                if (pipeData?.status === "error") {
                    throw new Error(pipeData.message);
                }

                setPipeline(pipeData?.data);

            } catch (err) {

                console.error(err);
                setError("Failed to load dashboard data.");

            } finally {

                setLoading(false);
            }
        }

        fetchDashboard();

    }, []);



    if (loading) {
        return (
            <div style={{ padding: "40px", textAlign: "center" }}>
                Loading dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: "40px", textAlign: "center", color: "red" }}>
                {error}
            </div>
        );
    }



    return (

        <div style={{ padding: "30px" }}>

            {/* Page Title */}

            <h1 style={{ marginBottom: "30px" }}>
                HR Dashboard
            </h1>



            {/* Analytics Cards */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "20px",
                    marginBottom: "40px"
                }}
            >

                <DashboardCard
                    title="Total Candidates"
                    value={stats?.total_candidates || 0}
                />

                <DashboardCard
                    title="Shortlisted"
                    value={stats?.shortlisted || 0}
                />

                <DashboardCard
                    title="Rejected"
                    value={stats?.rejected || 0}
                />

                <DashboardCard
                    title="Hired"
                    value={stats?.hired || 0}
                />

                <DashboardCard
                    title="Scheduled Interviews"
                    value={stats?.scheduled_interviews || 0}
                />

                <DashboardCard
                    title="Onboarding Completed"
                    value={stats?.onboarding_complete || 0}
                />

            </div>



            {/* Interview Pipeline */}

            <PipelineView data={pipeline} />

        </div>

    );
}



/* ---------------------- */
/* Dashboard Card */
/* ---------------------- */

function DashboardCard({ title, value, status }) {

    const statusColor =
        value === "Completed"
            ? "#16a34a"
            : value === "Pending"
                ? "#f59e0b"
                : "#111";

    return (

        <div
            style={{
                padding: "22px",
                borderRadius: "14px",
                background: "#ffffff",
                boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
            }}
        >

            <p
                style={{
                    fontSize: "13px",
                    color: "#777",
                    marginBottom: "8px"
                }}
            >
                {title}
            </p>

            <h3
                style={{
                    margin: 0,
                    color: status ? statusColor : "#111"
                }}
            >
                {value}
            </h3>

        </div>

    );
}



/* ---------------------- */
/* Pipeline Visualization */
/* ---------------------- */

function PipelineView({ data }) {

    if (!data) return null;

    const stages = [
        { name: "Pending", value: data.pending },
        { name: "Shortlisted", value: data.shortlisted },
        { name: "Rejected", value: data.rejected },
        { name: "Hired", value: data.hired }
    ];

    return (

        <div
            style={{
                background: "#fff",
                padding: "25px",
                borderRadius: "14px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.06)"
            }}
        >

            <h3 style={{ marginBottom: "20px" }}>
                Candidate Pipeline
            </h3>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "10px"
                }}
            >

                {stages.map((stage) => (

                    <div
                        key={stage.name}
                        style={{
                            flex: 1,
                            textAlign: "center",
                            padding: "12px",
                            borderRadius: "8px",
                            background: "#2563eb",
                            color: "#fff",
                            fontSize: "14px"
                        }}
                    >
                        <div>{stage.name}</div>
                        <strong>{stage.value}</strong>
                    </div>

                ))}

            </div>

        </div>

    );
}