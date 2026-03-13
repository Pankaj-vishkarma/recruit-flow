"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GalaxyBackground from "@/components/GalaxyBackground";

export default function Home() {

  const router = useRouter();
  const [blast, setBlast] = useState(false);

  useEffect(() => {

    const timer = setTimeout(() => {
      setBlast(true);
    }, 3000);

    const redirect = setTimeout(() => {
      router.replace("/login");
    }, 3800);

    return () => {
      clearTimeout(timer);
      clearTimeout(redirect);
    };

  }, [router]);

  return (

    <div className="relative min-h-screen flex items-center justify-center text-gray-200 overflow-hidden">

      {/* Galaxy Background */}

      <div className="absolute inset-0 z-0">
        <GalaxyBackground />
      </div>

      {/* Title */}

      <div className="relative z-10 text-center px-6">

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-5xl font-bold mb-4 text-white"
        >
          Welcome to RecruitFlow
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-gray-400 text-sm md:text-base"
        >
          Autonomous AI recruitment system
        </motion.p>

      </div>


      {/* Blast Layer */}

      <div className="absolute inset-0 pointer-events-none z-20">

        <AnimatePresence>

          {blast && (

            <motion.div
              initial={{ scale: 0.3, opacity: 0.7 }}
              animate={{ scale: 14, opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "120px",
                height: "120px",
                transform: "translate(-50%, -50%)",
                willChange: "transform, opacity",
                background:
                  "radial-gradient(circle, rgba(79,70,229,0.95) 0%, rgba(99,102,241,0.7) 35%, rgba(168,85,247,0.5) 50%, rgba(0,0,0,0) 70%)",
                filter: "blur(12px)"
              }}
            />

          )}

        </AnimatePresence>

      </div>

    </div>

  );
}