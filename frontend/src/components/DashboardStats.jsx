"use client";

export default function DashboardStats({ stats }) {

    if (!stats) return null;

    const cards = [

        {
            label: "Total Candidates",
            value: stats.total_candidates
        },

        {
            label: "Shortlisted",
            value: stats.shortlisted
        },

        {
            label: "Rejected",
            value: stats.rejected
        },

        {
            label: "Hired",
            value: stats.hired
        },

        {
            label: "Scheduled Interviews",
            value: stats.scheduled_interviews
        },

        {
            label: "Onboarding Completed",
            value: stats.onboarding_complete
        }

    ];

    return (

        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                marginBottom: "30px"
            }}
        >

            {cards.map((card, i) => (

                <div
                    key={i}
                    style={{
                        background: "#fff",
                        padding: "20px",
                        borderRadius: "12px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.06)"
                    }}
                >

                    <div
                        style={{
                            fontSize: "14px",
                            color: "#777",
                            marginBottom: "6px"
                        }}
                    >
                        {card.label}
                    </div>

                    <div
                        style={{
                            fontSize: "26px",
                            fontWeight: "600"
                        }}
                    >
                        {card.value}
                    </div>

                </div>

            ))}

        </div>

    );
}