"use client";

export default function DashboardStats({ stats }) {

    if (!stats) return null;

    const cards = [

        {
            label: "Total Candidates",
            value: stats.total_candidates,
            color: "#2563eb"
        },

        {
            label: "Shortlisted",
            value: stats.shortlisted,
            color: "#16a34a"
        },

        {
            label: "Rejected",
            value: stats.rejected,
            color: "#ef4444"
        },

        {
            label: "Hired",
            value: stats.hired,
            color: "#9333ea"
        },

        {
            label: "Scheduled Interviews",
            value: stats.scheduled_interviews,
            color: "#f59e0b"
        },

        {
            label: "Onboarding Completed",
            value: stats.onboarding_complete,
            color: "#14b8a6"
        }

    ];


    const formatNumber = (num) => {

        if (num === undefined || num === null) return "0";

        return new Intl.NumberFormat().format(num);
    };


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
                        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                        borderLeft: `5px solid ${card.color}`
                    }}
                >

                    <div
                        style={{
                            fontSize: "13px",
                            color: "#666",
                            marginBottom: "6px",
                            fontWeight: "500"
                        }}
                    >
                        {card.label}
                    </div>

                    <div
                        style={{
                            fontSize: "26px",
                            fontWeight: "600",
                            color: card.color
                        }}
                    >
                        {formatNumber(card.value)}
                    </div>

                </div>

            ))}

        </div>

    );
}