"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {

  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-indigo-50">

      <div className="text-center">

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-4"
        >
          Welcome to RecruitFlow
        </motion.h1>

        <p className="text-gray-500 mb-8">
          Autonomous AI recruitment system
        </p>

        <button
          onClick={() => router.push("/login")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Get Started
        </button>

      </div>

    </div>
  );
}