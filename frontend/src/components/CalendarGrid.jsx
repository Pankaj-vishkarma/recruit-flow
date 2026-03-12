"use client";

import { useState } from "react";
import { scheduleInterview } from "@/lib/api";

const slots = [
    { day: "Monday", time: "10:00 AM" },
    { day: "Monday", time: "2:00 PM" },
    { day: "Tuesday", time: "11:00 AM" },
    { day: "Wednesday", time: "3:00 PM" },
    { day: "Thursday", time: "1:00 PM" },
    { day: "Friday", time: "4:00 PM" }
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

            const slotText = `${selectedSlot.day} ${selectedSlot.time}`;

            const res = await scheduleInterview(
                slotText,
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
                maxWidth: "820px",
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

                    const slotText = `${slot.day} ${slot.time}`;
                    const isSelected =
                        selectedSlot?.day === slot.day &&
                        selectedSlot?.time === slot.time;

                    return (

                        <button
                            key={slotText}

                            /* IMPORTANT FOR PLAYWRIGHT */
                            data-slot={slotText}

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
                            <div>{slot.day}</div>
                            <div style={{ fontSize: "13px" }}>
                                {slot.time}
                            </div>
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
                        Selected Slot:{" "}
                        <b>
                            {selectedSlot.day} {selectedSlot.time}
                        </b>
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
                    ✅ Interview successfully scheduled for{" "}
                    <b>
                        {selectedSlot.day} {selectedSlot.time}
                    </b>
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