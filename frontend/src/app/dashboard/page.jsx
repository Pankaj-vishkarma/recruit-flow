"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardPage() {

    const router = useRouter();

    const [stats, setStats] = useState(null);
    const [pipeline, setPipeline] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        if (!isAuthenticated()) {
            router.push("/login");
            return;
        }

        if (!API_URL) {
            setError("API URL not configured.");
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        async function fetchDashboard() {

            try {

                const token = localStorage.getItem("token");

                if (!token) {
                    router.push("/login");
                    return;
                }

                /* ---------------------- */
                /* Fetch dashboard stats */
                /* ---------------------- */

                const statsRes = await fetch(`${API_URL}/dashboard/stats`, {
                    signal: controller.signal,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                });

                if (statsRes.status === 401) {
                    router.push("/login");
                    return;
                }

                if (!statsRes.ok) {
                    throw new Error("Failed to fetch stats");
                }

                const statsData = await statsRes.json();

                if (statsData?.status === "error") {
                    throw new Error(statsData.message);
                }

                setStats(statsData?.data || {});



                /* ---------------------- */
                /* Fetch pipeline data */
                /* ---------------------- */

                const pipeRes = await fetch(`${API_URL}/dashboard/pipeline`, {
                    signal: controller.signal,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                });

                if (pipeRes.status === 401) {
                    router.push("/login");
                    return;
                }

                if (!pipeRes.ok) {
                    throw new Error("Failed to fetch pipeline");
                }

                const pipeData = await pipeRes.json();

                if (pipeData?.status === "error") {
                    throw new Error(pipeData.message);
                }

                setPipeline(pipeData?.data || {});

            } catch (err) {

                if (err.name !== "AbortError") {
                    console.error(err);
                    setError("Failed to load dashboard data.");
                }

            } finally {

                setLoading(false);
            }
        }

        fetchDashboard();

        return () => controller.abort();

    }, [router]);



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

            <h1 style={{ marginBottom: "30px" }}>
                HR Dashboard
            </h1>



            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "20px",
                    marginBottom: "40px"
                }}
            >

                <DashboardCard title="Total Candidates" value={stats?.total_candidates || 0} />
                <DashboardCard title="Shortlisted" value={stats?.shortlisted || 0} />
                <DashboardCard title="Rejected" value={stats?.rejected || 0} />
                <DashboardCard title="Hired" value={stats?.hired || 0} />
                <DashboardCard title="Scheduled Interviews" value={stats?.scheduled_interviews || 0} />
                <DashboardCard title="Onboarding Completed" value={stats?.onboarding_complete || 0} />

            </div>

            <PipelineView data={pipeline} />

        </div>

    );
}



/* ---------------------- */
/* Dashboard Card */
/* ---------------------- */

function DashboardCard({ title, value }) {

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
                    color: "#111"
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
        { name: "Pending", value: data?.pending || 0 },
        { name: "Shortlisted", value: data?.shortlisted || 0 },
        { name: "Rejected", value: data?.rejected || 0 },
        { name: "Hired", value: data?.hired || 0 }
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