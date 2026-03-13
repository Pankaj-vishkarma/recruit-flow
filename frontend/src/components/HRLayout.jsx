"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
    Menu,
    X,
    LayoutDashboard,
    Users,
    CalendarDays,
    MessageSquare,
    LogOut,
} from "lucide-react";

export default function HRLayout({ children }) {

    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Candidates", href: "/candidates", icon: Users },
        { name: "Calendar", href: "/calendar", icon: CalendarDays },
        { name: "Chat", href: "/chat", icon: MessageSquare },
    ];

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    return (

        <div className="flex min-h-screen bg-gray-50">

            {/* Mobile Header */}

            <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b z-50 flex items-center justify-between px-4">

                <span className="font-semibold text-gray-800">
                    RecruitFlow HR
                </span>

                <button
                    onClick={() => setOpen(!open)}
                    className="p-1"
                >
                    {open ? <X size={22} /> : <Menu size={22} />}
                </button>

            </header>


            {/* Sidebar */}

            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-gray-200 transform transition-transform duration-300 z-50 flex flex-col
                ${open ? "translate-x-0" : "-translate-x-full"}
                lg:translate-x-0`}
            >

                {/* Sidebar Header */}

                <div className="px-6 py-6 border-b border-gray-800">

                    <h2 className="text-lg font-semibold tracking-wide">
                        RecruitFlow HR
                    </h2>

                </div>


                {/* Navigation */}

                <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2">

                    {navItems.map((item) => {

                        const active = pathname === item.href;
                        const Icon = item.icon;

                        return (

                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150
                                ${active
                                        ? "bg-gray-800 text-white"
                                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                    }`}
                            >

                                <Icon size={18} />

                                {item.name}

                            </Link>

                        );

                    })}

                </nav>


                {/* Logout */}

                <div className="p-4 border-t border-gray-800">

                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-sm bg-red-500 hover:bg-red-600 transition text-white"
                    >

                        <LogOut size={18} />

                        Logout

                    </button>

                </div>

            </aside>


            {/* Overlay */}

            {open && (
                <div
                    className="fixed inset-0 bg-black/40 lg:hidden z-40"
                    onClick={() => setOpen(false)}
                />
            )}


            {/* Main Content */}

            <main className="flex-1 lg:ml-64 pt-16 lg:pt-8">

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">

                    {children}

                </div>

            </main>

        </div>

    );

}