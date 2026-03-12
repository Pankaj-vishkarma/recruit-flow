"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function Home() {

  const router = useRouter();

  useEffect(() => {

    const auth = isAuthenticated();

    if (auth) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }

  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "18px",
        fontWeight: "500"
      }}
    >
      Loading Recruit Flow...
    </div>
  );
}