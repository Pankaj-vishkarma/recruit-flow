import CalendarGrid from "../../../components/CalendarGrid";

export default function CalendarPage() {

    return (

        <div className="space-y-6">

            {/* Page Header */}

            <div className="text-center">

                <h1 className="text-2xl font-semibold text-white">
                    Interview Calendar
                </h1>

                <p className="text-sm text-gray-400 mt-2">
                    Select an available time slot for your technical interview.
                </p>

            </div>


            {/* Calendar Component */}

            <CalendarGrid />

        </div>

    );

}