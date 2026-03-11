import CalendarGrid from "../../components/CalendarGrid";

export default function CalendarPage() {

    return (

        <div
            style={{
                padding: "40px",
                maxWidth: "1000px",
                margin: "auto"
            }}
        >

            {/* Page Title */}

            <h1
                style={{
                    textAlign: "center",
                    marginBottom: "10px"
                }}
            >
                Interview Calendar
            </h1>


            {/* Description */}

            <p
                style={{
                    textAlign: "center",
                    color: "#666",
                    marginBottom: "30px"
                }}
            >
                Select an available time slot for your technical interview.
            </p>


            {/* Calendar Component */}

            <CalendarGrid />

        </div>

    );

}