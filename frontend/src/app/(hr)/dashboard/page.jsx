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
            <div className="flex justify-center items-center h-[60vh] text-gray-500">
                Loading dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 py-20">
                {error}
            </div>
        );
    }


    return (

        <div className="space-y-10">

            <h1 className="text-2xl font-semibold text-gray-800">
                HR Dashboard
            </h1>


            {/* Stats Grid */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                <DashboardCard title="Total Candidates" value={stats?.total_candidates || 0} />
                <DashboardCard title="Shortlisted" value={stats?.shortlisted || 0} />
                <DashboardCard title="Rejected" value={stats?.rejected || 0} />
                <DashboardCard title="Hired" value={stats?.hired || 0} />
                <DashboardCard title="Scheduled Interviews" value={stats?.scheduled_interviews || 0} />
                <DashboardCard title="Onboarding Completed" value={stats?.onboarding_complete || 0} />

            </div>


            {/* Pipeline */}

            <PipelineView data={pipeline} />

        </div>

    );
}



/* ---------------------- */
/* Dashboard Card */
/* ---------------------- */

function DashboardCard({ title, value }) {

    return (

        <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition">

            <p className="text-sm text-gray-500 mb-2">
                {title}
            </p>

            <h3 className="text-xl font-semibold text-gray-900">
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

        <div className="bg-white border rounded-xl p-6 shadow-sm">

            <h3 className="text-lg font-semibold mb-6 text-gray-800">
                Candidate Pipeline
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                {stages.map((stage) => (

                    <div
                        key={stage.name}
                        className="bg-blue-600 text-white rounded-lg p-4 text-center"
                    >

                        <div className="text-sm">
                            {stage.name}
                        </div>

                        <strong className="text-lg">
                            {stage.value}
                        </strong>

                    </div>

                ))}

            </div>

        </div>

    );

}