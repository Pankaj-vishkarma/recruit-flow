"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GalaxyBackground from "@/components/GalaxyBackground";

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
    const [isDesktop, setIsDesktop] = useState(false);

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

    /* Detect screen size */
    useEffect(() => {

        const checkScreen = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };

        checkScreen();
        window.addEventListener("resize", checkScreen);

        return () => {
            window.removeEventListener("resize", checkScreen);
        };

    }, []);

    /* Prevent scroll when sidebar open on mobile */
    useEffect(() => {

        if (!isDesktop) {
            document.body.style.overflow = open ? "hidden" : "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };

    }, [open, isDesktop]);

    /* Close sidebar with ESC key */
    useEffect(() => {

        const handleEsc = (e) => {
            if (e.key === "Escape") setOpen(false);
        };

        window.addEventListener("keydown", handleEsc);

        return () => {
            window.removeEventListener("keydown", handleEsc);
        };

    }, []);

    return (

        <div className="relative flex min-h-screen text-gray-200 overflow-x-hidden">

            {/* Galaxy Background */}
            <GalaxyBackground />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-14 bg-black/60 backdrop-blur-xl border-b border-gray-800 z-50 flex items-center justify-between px-6">

                <span className="font-semibold text-white tracking-wide">
                    RecruitFlow HR
                </span>

                {/* Mobile menu button */}
                {!isDesktop && (
                    <button
                        onClick={() => setOpen(!open)}
                        className="p-2 rounded-md hover:bg-gray-800 transition"
                        aria-label="Toggle Menu"
                    >
                        {open ? <X size={22} /> : <Menu size={22} />}
                    </button>
                )}

            </header>


            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    x: isDesktop ? 0 : open ? 0 : -260
                }}
                transition={{
                    duration: 0.28,
                    ease: "easeInOut"
                }}
                className="fixed top-0 left-0 h-full w-64 bg-black/70 backdrop-blur-xl border-r border-gray-800 z-50 flex flex-col"
            >

                {/* Sidebar Header */}
                <div className="px-6 py-6 border-b border-gray-800 mt-14">

                    <h2 className="text-lg font-semibold text-white tracking-wide">
                        RecruitFlow HR
                    </h2>

                </div>


                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">

                    {navItems.map((item, index) => {

                        const active = pathname === item.href;
                        const Icon = item.icon;

                        return (

                            <motion.div
                                key={item.href}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.05 }}
                            >

                                <Link
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all
                  ${active
                                            ? "bg-indigo-600 text-white shadow-lg"
                                            : "text-gray-300 hover:bg-gray-800"
                                        }`}
                                >

                                    <Icon size={18} />

                                    {item.name}

                                </Link>

                            </motion.div>

                        );

                    })}

                </nav>


                {/* Logout */}
                <div className="p-4 border-t border-gray-800">

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl text-sm bg-red-500 hover:bg-red-600 text-white transition"
                    >

                        <LogOut size={18} />

                        Logout

                    </motion.button>

                </div>

            </motion.aside>


            {/* Mobile overlay */}
            {open && !isDesktop && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setOpen(false)}
                />
            )}


            {/* Main Content */}
            <motion.main
                key={pathname}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28 }}
                className="flex-1 ml-0 lg:ml-64 pt-16 relative z-10"
            >

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">

                    {children}

                </div>

            </motion.main>

        </div>

    );

}