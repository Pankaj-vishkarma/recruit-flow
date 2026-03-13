"use client";

import { motion } from "framer-motion";

export default function AuthLayout({ children, title, subtitle }) {

    return (

        <div className="min-h-screen grid md:grid-cols-2">

            {/* Left Side Illustration */}

            <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-10">

                <h1 className="text-4xl font-bold mb-4">
                    RecruitFlow
                </h1>

                <p className="text-sm opacity-90 max-w-sm text-center">
                    Autonomous AI powered HR recruitment platform that
                    automates screening, interviews and onboarding.
                </p>

            </div>


            {/* Right Side Form */}

            <div className="flex items-center justify-center p-6 sm:p-10 bg-gray-50">

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md bg-white shadow-xl rounded-xl p-8"
                >

                    {title && (
                        <h2 className="text-2xl font-semibold mb-2 text-gray-800">
                            {title}
                        </h2>
                    )}

                    {subtitle && (
                        <p className="text-sm text-gray-500 mb-6">
                            {subtitle}
                        </p>
                    )}

                    {children}

                </motion.div>

            </div>

        </div>

    );
}