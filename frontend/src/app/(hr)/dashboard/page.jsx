"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { motion } from "framer-motion";

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

                /* Fetch dashboard stats */

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


                /* Fetch pipeline data */

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
            <div className="flex justify-center items-center h-[60vh] text-gray-400 text-lg">
                Loading dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-400 py-20">
                {error}
            </div>
        );
    }


    return (

        <div className="space-y-10">

            <h1 className="text-3xl font-bold text-white tracking-wide">
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



/* Dashboard Card */

function DashboardCard({ title, value }) {

    return (

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg transition-all"
        >

            <p className="text-sm text-gray-300 mb-2">
                {title}
            </p>

            <h3 className="text-2xl font-semibold text-white">
                {value}
            </h3>

        </motion.div>

    );

}



/* Pipeline Visualization */

function PipelineView({ data }) {

    if (!data) return null;

    const stages = [
        { name: "Pending", value: data?.pending || 0 },
        { name: "Shortlisted", value: data?.shortlisted || 0 },
        { name: "Rejected", value: data?.rejected || 0 },
        { name: "Hired", value: data?.hired || 0 }
    ];

    return (

        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-lg">

            <h3 className="text-lg font-semibold mb-6 text-white">
                Candidate Pipeline
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                {stages.map((stage) => (

                    <motion.div
                        key={stage.name}
                        whileHover={{ scale: 1.05 }}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-4 text-center shadow-lg"
                    >

                        <div className="text-sm opacity-90">
                            {stage.name}
                        </div>

                        <strong className="text-lg">
                            {stage.value}
                        </strong>

                    </motion.div>

                ))}

            </div>

        </div>

    );

}