import CalendarGrid from "../../../components/CalendarGrid";

export default function CalendarPage() {

    return (

        <div className="space-y-6">

            {/* Page Header */}

            <div className="text-center">

                <h1 className="text-2xl font-semibold text-gray-800">
                    Interview Calendar
                </h1>

                <p className="text-sm text-gray-500 mt-2">
                    Select an available time slot for your technical interview.
                </p>

            </div>


            {/* Calendar Container */}

            <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-6 lg:p-8">

                <CalendarGrid />

            </div>

        </div>

    );

}