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
            className="grid gap-6 mb-8"
            style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
            }}
        >

            {cards.map((card, i) => (

                <div
                    key={i}
                    className="glass p-6 rounded-xl card-glow transition-all duration-300 hover:scale-[1.02]"
                    style={{
                        borderLeft: `4px solid ${card.color}`
                    }}
                >

                    <div
                        className="text-sm mb-2 font-medium"
                        style={{ color: "#9ca3af" }}
                    >
                        {card.label}
                    </div>

                    <div
                        className="text-3xl font-semibold"
                        style={{ color: card.color }}
                    >
                        {formatNumber(card.value)}
                    </div>

                </div>

            ))}

        </div>

    );

}