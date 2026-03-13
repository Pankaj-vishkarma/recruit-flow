"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    LayoutDashboard,
    MessageCircle,
    Calendar,
    Users
} from "lucide-react";

export default function Sidebar() {

    const pathname = usePathname();

    const navItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard
        },
        {
            name: "Candidate Chat",
            path: "/chat",
            icon: MessageCircle
        },
        {
            name: "Interview Calendar",
            path: "/calendar",
            icon: Calendar
        },
        {
            name: "Candidates",
            path: "/candidates",
            icon: Users
        },
    ];

    return (
        <aside
            className="
      hidden md:flex
      flex-col
      w-64
      min-h-screen
      bg-gray-900
      text-white
      p-6
      border-r
      border-gray-800
      sticky
      top-0
      "
        >

            {/* Logo */}

            <div className="flex items-center gap-3 mb-10">

                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">
                    R
                </div>

                <span className="text-lg font-semibold tracking-wide">
                    RecruitFlow
                </span>

            </div>


            {/* Navigation */}

            <nav className="flex flex-col gap-2 flex-1">

                {navItems.map((item) => {

                    const active = pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`
              flex items-center gap-3
              px-4 py-3
              rounded-lg
              text-sm
              font-medium
              transition-all
              duration-200
              ${active
                                    ? "bg-gray-800 text-white shadow-inner"
                                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                }
              `}
                        >

                            <Icon size={18} />

                            {item.name}

                        </Link>
                    );

                })}

            </nav>

        </aside>
    );
}