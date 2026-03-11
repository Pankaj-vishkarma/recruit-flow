"use client";

import { useEffect, useState } from "react";
import {
    getCandidates,
    updateCandidateStatus,
    deleteCandidate
} from "../../lib/api";

export default function CandidatesPage() {

    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [actionLoading, setActionLoading] = useState(false);



    async function fetchCandidates() {

        try {

            setLoading(true);
            setError(null);

            const res = await getCandidates(page);

            if (res?.status === "error") {
                throw new Error(res.message);
            }

            setCandidates(res?.data || []);

        } catch (err) {

            console.error(err);
            setError("Failed to load candidates.");

        } finally {

            setLoading(false);
        }
    }



    useEffect(() => {

        fetchCandidates();

    }, [page]);



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
        return <div style={{ padding: "40px" }}>Loading candidates...</div>;
    }

    if (error) {
        return <div style={{ padding: "40px", color: "red" }}>{error}</div>;
    }



    return (

        <div style={{ padding: "30px" }}>

            <h1 style={{ marginBottom: "20px" }}>
                Candidates
            </h1>

            <div
                style={{
                    background: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                    overflow: "hidden"
                }}
            >

                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse"
                    }}
                >

                    <thead
                        style={{
                            background: "#f3f4f6"
                        }}
                    >

                        <tr>

                            <th style={thStyle}>Name</th>
                            <th style={thStyle}>Skills</th>
                            <th style={thStyle}>Interview</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Onboarding</th>
                            <th style={thStyle}>Actions</th>

                        </tr>

                    </thead>

                    <tbody>

                        {candidates.length === 0 && (

                            <tr>
                                <td colSpan="6" style={{ padding: "20px", textAlign: "center" }}>
                                    No candidates found
                                </td>
                            </tr>

                        )}

                        {candidates.map((candidate) => (

                            <tr key={candidate.name} style={{ borderTop: "1px solid #eee" }}>

                                <td style={tdStyle}>
                                    {candidate.name}
                                </td>

                                <td style={tdStyle}>
                                    {candidate.skills?.join(", ") || "None"}
                                </td>

                                <td style={tdStyle}>
                                    {candidate.scheduled_time || "Not scheduled"}
                                </td>

                                <td style={tdStyle}>
                                    {candidate.status || "Pending"}
                                </td>

                                <td style={tdStyle}>
                                    {candidate.onboarding_complete ? "Completed" : "Pending"}
                                </td>

                                <td style={tdStyle}>

                                    <button
                                        disabled={actionLoading}
                                        onClick={() => handleStatus(candidate.name, "shortlisted")}
                                        style={btnStyle}
                                    >
                                        Shortlist
                                    </button>

                                    <button
                                        disabled={actionLoading}
                                        onClick={() => handleStatus(candidate.name, "rejected")}
                                        style={{ ...btnStyle, background: "#ef4444" }}
                                    >
                                        Reject
                                    </button>

                                    <button
                                        disabled={actionLoading}
                                        onClick={() => handleDelete(candidate.name)}
                                        style={{ ...btnStyle, background: "#111" }}
                                    >
                                        Delete
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>



            {/* Pagination */}

            <div style={{ marginTop: "20px" }}>

                <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1 || loading}
                    style={btnStyle}
                >
                    Previous
                </button>

                <span style={{ margin: "0 10px" }}>
                    Page {page}
                </span>

                <button
                    onClick={() => setPage(page + 1)}
                    disabled={loading}
                    style={btnStyle}
                >
                    Next
                </button>

            </div>

        </div>

    );
}



const thStyle = {
    padding: "14px",
    textAlign: "left",
    fontSize: "14px",
    color: "#555"
};

const tdStyle = {
    padding: "14px",
    fontSize: "14px"
};

const btnStyle = {
    padding: "6px 10px",
    marginRight: "6px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer"
};