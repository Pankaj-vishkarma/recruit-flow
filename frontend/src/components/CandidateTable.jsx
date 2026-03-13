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

        <div className="glass rounded-xl overflow-hidden">

            <div className="overflow-x-auto">

                <table className="w-full text-sm text-left">

                    <thead className="bg-white/5 border-b border-white/10">

                        <tr>

                            <th className="px-5 py-3 font-semibold">Name</th>
                            <th className="px-5 py-3 font-semibold">Skills</th>
                            <th className="px-5 py-3 font-semibold">Status</th>
                            <th className="px-5 py-3 font-semibold">Interview</th>
                            <th className="px-5 py-3 font-semibold">Actions</th>

                        </tr>

                    </thead>

                    <tbody>

                        {candidates.map((c) => (

                            <tr
                                key={c.name}
                                className="border-b border-white/5 hover:bg-white/5 transition"
                            >

                                <td className="px-5 py-4 font-medium">
                                    {c.name}
                                </td>

                                <td className="px-5 py-4 text-gray-300">
                                    {c.skills?.join(", ")}
                                </td>

                                <td className="px-5 py-4">

                                    <span className="px-3 py-1 rounded-full text-xs bg-indigo-500/20 text-indigo-300">

                                        {c.status}

                                    </span>

                                </td>

                                <td className="px-5 py-4 text-gray-400">
                                    {c.scheduled_time || "-"}
                                </td>

                                <td className="px-5 py-4 flex gap-2 flex-wrap">

                                    <button
                                        onClick={() => handleStatus(c.name, "shortlisted")}
                                        className="px-3 py-1 rounded-md text-xs bg-green-500/20 text-green-300 hover:bg-green-500/30 transition"
                                    >
                                        Shortlist
                                    </button>

                                    <button
                                        onClick={() => handleStatus(c.name, "rejected")}
                                        className="px-3 py-1 rounded-md text-xs bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 transition"
                                    >
                                        Reject
                                    </button>

                                    <button
                                        onClick={() => handleDelete(c.name)}
                                        className="px-3 py-1 rounded-md text-xs bg-red-500/20 text-red-300 hover:bg-red-500/30 transition"
                                    >
                                        Delete
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>

    );

}