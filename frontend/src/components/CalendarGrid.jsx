"use client";

import { useState } from "react";
import { scheduleInterview } from "../lib/api";

const slots = [
    "Monday 10:00 AM",
    "Monday 2:00 PM",
    "Tuesday 11:00 AM",
    "Wednesday 3:00 PM",
    "Thursday 1:00 PM",
    "Friday 4:00 PM"
];

export default function CalendarGrid() {

    const [selectedSlot, setSelectedSlot] = useState(null);
    const [confirmed, setConfirmed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSelect = (slot) => {

        if (loading) return;

        setSelectedSlot(slot);
        setConfirmed(false);
        setError(null);
    };

    const handleConfirm = async () => {

        if (!selectedSlot) return;

        setLoading(true);
        setError(null);

        try {

            /* ----------------------------- */
            /* Send scheduling request */
            /* ----------------------------- */

            const res = await scheduleInterview(
                selectedSlot,
                "candidate"
            );

            if (res?.status === "success") {

                setConfirmed(true);

            } else {

                throw new Error(res?.message || "Scheduling failed");
            }

        } catch (err) {

            console.error(err);

            setError(err?.message || "Failed to schedule interview.");

        } finally {

            setLoading(false);
        }
    };

    return (

        <div
            style={{
                maxWidth: "800px",
                margin: "auto",
                padding: "30px",
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 8px 30px rgba(0,0,0,0.08)"
            }}
        >

            <h2
                style={{
                    textAlign: "center",
                    marginBottom: "25px",
                    fontSize: "22px",
                    fontWeight: "600"
                }}
            >
                Schedule Your Interview
            </h2>

            {/* Calendar Grid */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "14px"
                }}
            >

                {slots.map((slot) => {

                    const isSelected = selectedSlot === slot;

                    return (

                        <button
                            key={slot}

                            /* IMPORTANT FOR PLAYWRIGHT */
                            data-slot={slot}

                            onClick={() => handleSelect(slot)}

                            disabled={loading}

                            style={{
                                padding: "16px",
                                borderRadius: "10px",
                                border: isSelected
                                    ? "2px solid #2563eb"
                                    : "1px solid #ddd",
                                background: isSelected
                                    ? "#2563eb"
                                    : "#f8fafc",
                                color: isSelected
                                    ? "#fff"
                                    : "#333",
                                cursor: loading ? "not-allowed" : "pointer",
                                fontWeight: "500",
                                transition: "0.2s",
                                boxShadow: isSelected
                                    ? "0 4px 12px rgba(37,99,235,0.3)"
                                    : "none"
                            }}
                        >
                            {slot}
                        </button>

                    );
                })}

            </div>



            {/* Selected Slot */}

            {selectedSlot && !confirmed && (

                <div
                    style={{
                        marginTop: "25px",
                        textAlign: "center"
                    }}
                >

                    <p style={{ marginBottom: "10px" }}>
                        Selected Slot: <b>{selectedSlot}</b>
                    </p>

                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        style={{
                            padding: "12px 24px",
                            borderRadius: "8px",
                            border: "none",
                            background: "#16a34a",
                            color: "#fff",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontWeight: "500"
                        }}
                    >
                        {loading ? "Scheduling..." : "Confirm Interview"}
                    </button>

                </div>

            )}



            {/* Confirmation */}

            {confirmed && (

                <div
                    style={{
                        marginTop: "25px",
                        textAlign: "center",
                        color: "#16a34a",
                        fontWeight: "600",
                        fontSize: "16px"
                    }}
                >
                    ✅ Interview successfully scheduled for <b>{selectedSlot}</b>
                </div>

            )}



            {/* Error */}

            {error && (

                <div
                    style={{
                        marginTop: "15px",
                        textAlign: "center",
                        color: "red"
                    }}
                >
                    {error}
                </div>

            )}

        </div>

    );

}