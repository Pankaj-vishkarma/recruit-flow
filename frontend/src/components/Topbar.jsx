"use client";

import { Bell, Search } from "lucide-react";

export default function Topbar() {
    return (
        <header
            className="
      w-full
      h-[64px]
      bg-white
      border-b
      flex
      items-center
      justify-between
      px-4 sm:px-6 lg:px-8
      shadow-sm
      sticky
      top-0
      z-40
      "
        >

            {/* Left Section */}

            <div className="flex items-center gap-6">

                <h2 className="text-lg font-semibold text-gray-800">
                    Recruit Flow Dashboard
                </h2>


                {/* Search Bar */}

                <div className="hidden md:flex items-center relative">

                    <Search
                        size={16}
                        className="absolute left-3 text-gray-400"
                    />

                    <input
                        type="text"
                        placeholder="Search candidates..."
                        className="
            pl-9 pr-3 py-2
            text-sm
            border
            border-gray-200
            rounded-lg
            bg-gray-50
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            focus:bg-white
            transition
            "
                    />

                </div>

            </div>


            {/* Right Section */}

            <div className="flex items-center gap-4">

                {/* Notification */}

                <button
                    className="
          p-2
          rounded-lg
          hover:bg-gray-100
          transition
          "
                >
                    <Bell size={18} />
                </button>


                {/* User Profile */}

                <div className="flex items-center gap-3">

                    <div
                        className="
            w-9
            h-9
            rounded-full
            bg-blue-600
            text-white
            flex
            items-center
            justify-center
            text-sm
            font-semibold
            shadow-sm
            "
                    >
                        H
                    </div>

                    <span className="hidden sm:block text-sm text-gray-700 font-medium">
                        HR Admin
                    </span>

                </div>

            </div>

        </header>
    );
}