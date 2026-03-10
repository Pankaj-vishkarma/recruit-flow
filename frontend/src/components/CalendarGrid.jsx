"use client";

import { useState } from "react";

const slots = [
    "Monday 10AM",
    "Monday 2PM",
    "Tuesday 11AM",
    "Wednesday 3PM"
];

export default function CalendarGrid() {

    const [booked, setBooked] = useState(null);

    return (

        <div style={{ display: "grid", gap: "10px" }}>

            {slots.map(slot => (
                <button
                    key={slot}
                    data-slot={slot}
                    onClick={() => setBooked(slot)}
                    style={{
                        padding: "10px",
                        background: booked === slot ? "red" : "#ccc"
                    }}
                >
                    {slot}
                </button>
            ))}

        </div>

    );

}