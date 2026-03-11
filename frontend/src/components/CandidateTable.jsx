"use client";

import { updateCandidateStatus, deleteCandidate } from "@/lib/api";

export default function CandidateTable({ candidates, reload }) {

    async function handleStatus(name, status) {

        const res = await updateCandidateStatus(name, status);

        if (res.status === "error") {
            alert(res.message);
            return;
        }

        reload();
    }

    async function handleDelete(name) {

        if (!confirm("Delete candidate?")) return;

        const res = await deleteCandidate(name);

        if (res.status === "error") {
            alert(res.message);
            return;
        }

        reload();
    }

    return (
        <table border="1" cellPadding="10">

            <thead>
                <tr>
                    <th>Name</th>
                    <th>Skills</th>
                    <th>Status</th>
                    <th>Interview</th>
                    <th>Actions</th>
                </tr>
            </thead>

            <tbody>

                {candidates.map((c) => (

                    <tr key={c.name}>

                        <td>{c.name}</td>

                        <td>{c.skills?.join(", ")}</td>

                        <td>{c.status}</td>

                        <td>{c.scheduled_time || "-"}</td>

                        <td>

                            <button
                                onClick={() => handleStatus(c.name, "shortlisted")}
                            >
                                Shortlist
                            </button>

                            <button
                                onClick={() => handleStatus(c.name, "rejected")}
                            >
                                Reject
                            </button>

                            <button
                                onClick={() => handleDelete(c.name)}
                            >
                                Delete
                            </button>

                        </td>

                    </tr>

                ))}

            </tbody>

        </table>
    );
}