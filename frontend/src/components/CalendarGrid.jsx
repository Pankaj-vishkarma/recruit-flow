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

            console.log("API RESPONSE:", res);

            // ✅ FIXED CONDITION
            if (res?.success) {

                setConfirmed(true);

            } else {

                throw new Error(res?.message || "Failed to schedule interview");
            }

        } catch (err) {

            console.error(err);

            setError(err?.message || "Failed to schedule interview.");

        } finally {

            setLoading(false);
        }
    };



    return (

        <div className="glass max-w-3xl mx-auto p-8 rounded-xl border border-white/10">

            <h2 className="text-center mb-6 text-xl font-semibold text-white">
                Schedule Your Interview
            </h2>



            {/* Calendar Grid */}

            <div
                className="grid gap-4"
                style={{
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))"
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

                            className={`
                                p-4 rounded-lg border text-sm font-medium transition
                                ${isSelected
                                    ? "bg-indigo-600 text-white border-indigo-500 shadow-lg"
                                    : "bg-white/5 text-gray-200 border-white/10 hover:bg-white/10"}
                                ${loading ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
                            `}
                        >
                            <div>{slot.day}</div>
                            <div className="text-xs opacity-80">
                                {slot.time}
                            </div>
                        </button>

                    );
                })}

            </div>



            {/* Selected Slot */}

            {selectedSlot && !confirmed && (

                <div className="mt-6 text-center">

                    <p className="mb-3 text-gray-300">
                        Selected Slot:{" "}
                        <b>
                            {selectedSlot.day} {selectedSlot.time}
                        </b>
                    </p>

                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="
                            px-6 py-3
                            rounded-lg
                            bg-green-600
                            text-white
                            font-medium
                            hover:bg-green-700
                            transition
                            disabled:opacity-60
                        "
                    >
                        {loading ? "Scheduling..." : "Confirm Interview"}
                    </button>

                </div>

            )}



            {/* Confirmation */}

            {confirmed && (

                <div className="mt-6 text-center text-green-400 font-semibold text-sm">
                    ✅ Interview successfully scheduled for{" "}
                    <b>
                        {selectedSlot.day} {selectedSlot.time}
                    </b>
                </div>

            )}



            {/* Error */}

            {error && (

                <div className="mt-4 text-center text-red-400">
                    {error}
                </div>

            )}

        </div>

    );

}