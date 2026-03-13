"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { logout, isAuthenticated } from "@/lib/auth";

import {
    LayoutDashboard,
    Users,
    Calendar,
    MessageCircle,
    LogOut
} from "lucide-react";

export default function Navbar() {

    const router = useRouter();
    const pathname = usePathname();
    const auth = isAuthenticated();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Candidates", href: "/candidates", icon: Users },
        { name: "Calendar", href: "/calendar", icon: Calendar },
        { name: "Chat", href: "/chat", icon: MessageCircle },
    ];

    return (
        <nav
            className="
      w-full
      flex
      items-center
      justify-between
      px-4 sm:px-6 lg:px-10
      py-4
      bg-white
      border-b
      shadow-sm
      sticky
      top-0
      z-50
      "
        >

            {/* Logo */}

            <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">

                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                    R
                </div>

                Recruit Flow

            </div>


            {/* Navigation */}

            <div className="hidden md:flex items-center gap-6 text-sm font-medium">

                {navItems.map((item) => {

                    const Icon = item.icon;
                    const active = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
              flex items-center gap-2
              transition
              ${active
                                    ? "text-blue-600 font-semibold"
                                    : "text-gray-600 hover:text-blue-600"
                                }
              `}
                        >

                            <Icon size={16} />

                            {item.name}

                        </Link>
                    );

                })}

            </div>


            {/* Auth Section */}

            <div className="flex items-center gap-4">

                {auth ? (

                    <button
                        onClick={handleLogout}
                        className="
            flex items-center gap-2
            px-4 py-2
            text-sm
            bg-red-500
            text-white
            rounded-lg
            hover:bg-red-600
            transition
            "
                    >
                        <LogOut size={16} />
                        Logout
                    </button>

                ) : (

                    <div className="flex items-center gap-4 text-sm font-medium">

                        <Link
                            href="/login"
                            className="text-gray-600 hover:text-blue-600 transition"
                        >
                            Login
                        </Link>

                        <Link
                            href="/register"
                            className="
              px-4 py-2
              rounded-lg
              bg-blue-600
              text-white
              hover:bg-blue-700
              transition
              "
                        >
                            Register
                        </Link>

                    </div>

                )}

            </div>

        </nav>
    );
}