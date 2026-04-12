"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { roleHomeRoute } from "@judo-bracket/config";
import type { UserRole } from "@judo-bracket/types";

export default function AuthCallbackPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.replace("/sign-in");
      return;
    }

    const role = (user.publicMetadata?.role as UserRole) || "ATHLETE";
    const destination = roleHomeRoute[role] || "/athlete";

    router.replace(destination);
  }, [user, isLoaded, router]);

  if (!isLoaded || !user) {
    return (
      <div style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "48px",
            height: "48px",
            border: "3px solid #e4e4e7",
            borderTopColor: "#18181b",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px"
          }} />
          <p style={{ color: "#71717a" }}>로그인 확인 중...</p>
        </div>
      </div>
    );
  }

  return null;
}
