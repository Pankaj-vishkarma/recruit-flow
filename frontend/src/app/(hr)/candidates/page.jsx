"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import {
    getCandidates,
    updateCandidateStatus,
    deleteCandidate
} from "@/lib/api";

export default function CandidatesPage() {

    const router = useRouter();

    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [actionLoading, setActionLoading] = useState(false);



    async function fetchCandidates(signal) {

        try {

            setLoading(true);
            setError(null);

            const res = await getCandidates(page);

            if (res?.status === "error") {
                throw new Error(res.message);
            }

            setCandidates(res?.data || []);

        } catch (err) {

            if (err.name !== "AbortError") {
                console.error(err);
                setError("Failed to load candidates.");
            }

        } finally {

            setLoading(false);
        }
    }



    useEffect(() => {

        if (!isAuthenticated()) {
            router.push("/login");
            return;
        }

        const controller = new AbortController();

        fetchCandidates(controller.signal);

        return () => controller.abort();

    }, [page, router]);



    async function handleStatus(name, status) {

        try {

            setActionLoading(true);

            const res = await updateCandidateStatus(name, status);

            if (res?.status === "error") {
                alert(res.message);
                return;
            }

            fetchCandidates();

        } catch (err) {

            console.error(err);
            alert("Failed to update candidate status");

        } finally {

            setActionLoading(false);
        }
    }



    async function handleDelete(name) {

        if (!confirm("Delete candidate?")) return;

        try {

            setActionLoading(true);

            const res = await deleteCandidate(name);

            if (res?.status === "error") {
                alert(res.message);
                return;
            }

            fetchCandidates();

        } catch (err) {

            console.error(err);
            alert("Failed to delete candidate");

        } finally {

            setActionLoading(false);
        }
    }



    if (loading) {
        return (
            <div className="py-20 text-center text-gray-500">
                Loading candidates...
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-20 text-center text-red-500">
                {error}
            </div>
        );
    }



    return (

        <div className="space-y-6">

            <h1 className="text-2xl font-semibold text-gray-800">
                Candidates
            </h1>


            {/* Desktop Table */}

            <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-x-auto">

                <table className="min-w-full text-sm">

                    <thead className="bg-gray-50">

                        <tr>

                            <th className="px-4 py-3 text-left text-gray-600">Name</th>
                            <th className="px-4 py-3 text-left text-gray-600">Skills</th>
                            <th className="px-4 py-3 text-left text-gray-600">Interview</th>
                            <th className="px-4 py-3 text-left text-gray-600">Status</th>
                            <th className="px-4 py-3 text-left text-gray-600">Onboarding</th>
                            <th className="px-4 py-3 text-left text-gray-600">Actions</th>

                        </tr>

                    </thead>

                    <tbody>

                        {candidates.length === 0 && (

                            <tr>
                                <td colSpan="6" className="text-center py-6">
                                    No candidates found
                                </td>
                            </tr>

                        )}

                        {candidates.map((candidate) => (

                            <tr key={candidate._id} className="border-t">

                                <td className="px-4 py-3">
                                    {candidate.name}
                                </td>

                                <td className="px-4 py-3">
                                    {candidate.skills?.join(", ") || "None"}
                                </td>

                                <td className="px-4 py-3">
                                    {candidate.scheduled_time || "Not scheduled"}
                                </td>

                                <td className="px-4 py-3">
                                    <StatusBadge status={candidate.status || "Pending"} />
                                </td>

                                <td className="px-4 py-3">
                                    {candidate.onboarding_complete ? "Completed" : "Pending"}
                                </td>

                                <td className="px-4 py-3 flex flex-wrap gap-2">

                                    <button
                                        disabled={actionLoading}
                                        onClick={() => handleStatus(candidate._id, "shortlisted")}
                                        className="px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700"
                                    >
                                        Shortlist
                                    </button>

                                    <button
                                        disabled={actionLoading}
                                        onClick={() => handleStatus(candidate._id, "rejected")}
                                        className="px-3 py-1 rounded bg-red-500 text-white text-xs hover:bg-red-600"
                                    >
                                        Reject
                                    </button>

                                    <button
                                        disabled={actionLoading}
                                        onClick={() => handleDelete(candidate._id)}
                                        className="px-3 py-1 rounded bg-gray-900 text-white text-xs hover:bg-black"
                                    >
                                        Delete
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>


            {/* Mobile Cards */}

            <div className="md:hidden space-y-4">

                {candidates.map((candidate) => (

                    <div key={candidate._id} className="bg-white border rounded-xl p-4 shadow-sm">

                        <div className="flex justify-between mb-2">

                            <h3 className="font-medium">
                                {candidate.name}
                            </h3>

                            <StatusBadge status={candidate.status || "Pending"} />

                        </div>

                        <p className="text-sm text-gray-500">
                            Skills: {candidate.skills?.join(", ") || "None"}
                        </p>

                        <p className="text-sm text-gray-500">
                            Interview: {candidate.scheduled_time || "Not scheduled"}
                        </p>

                        <p className="text-sm text-gray-500">
                            Onboarding: {candidate.onboarding_complete ? "Completed" : "Pending"}
                        </p>

                        <div className="flex gap-2 mt-3">

                            <button
                                disabled={actionLoading}
                                onClick={() => handleStatus(candidate._id, "shortlisted")}
                                className="flex-1 py-1 rounded bg-blue-600 text-white text-xs"
                            >
                                Shortlist
                            </button>

                            <button
                                disabled={actionLoading}
                                onClick={() => handleStatus(candidate._id, "rejected")}
                                className="flex-1 py-1 rounded bg-red-500 text-white text-xs"
                            >
                                Reject
                            </button>

                            <button
                                disabled={actionLoading}
                                onClick={() => handleDelete(candidate._id)}
                                className="flex-1 py-1 rounded bg-gray-900 text-white text-xs"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                ))}

            </div>



            {/* Pagination */}

            <div className="flex items-center justify-center gap-4">

                <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1 || loading}
                    className="px-4 py-2 rounded bg-blue-600 text-white text-sm disabled:bg-gray-400"
                >
                    Previous
                </button>

                <span className="text-sm text-gray-600">
                    Page {page}
                </span>

                <button
                    onClick={() => setPage(page + 1)}
                    disabled={loading}
                    className="px-4 py-2 rounded bg-blue-600 text-white text-sm disabled:bg-gray-400"
                >
                    Next
                </button>

            </div>

        </div>

    );
}



function StatusBadge({ status }) {

    const colors = {
        shortlisted: "bg-green-600",
        rejected: "bg-red-500",
        pending: "bg-yellow-500"
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs text-white ${colors[status?.toLowerCase()] || "bg-gray-500"}`}>
            {status}
        </span>
    );
}