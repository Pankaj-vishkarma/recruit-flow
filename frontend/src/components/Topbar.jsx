"use client";

export default function Topbar() {
    return (
        <div
            style={{
                height: "60px",
                background: "white",
                borderBottom: "1px solid #eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
            }}
        >
            <h3 style={{ margin: 0 }}>Recruit Flow HR Dashboard</h3>

            <div>
                <span style={{ fontSize: "14px", color: "#555" }}>
                    HR Admin
                </span>
            </div>
        </div>
    );
}