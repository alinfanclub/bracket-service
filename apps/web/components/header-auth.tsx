"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";

import { UserAvatar } from "./user-avatar";

export function HeaderAuth() {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();

  if (!isSignedIn) {
    return (
      <div style={{ display: "flex", gap: "12px" }}>
        <Link
          href="/sign-in"
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            background: "transparent",
            border: "1px solid #e4e4e7",
            color: "#18181b",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 500
          }}
        >
          로그인
        </Link>
        <Link
          href="/sign-up"
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            background: "#18181b",
            border: "none",
            color: "white",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 500
          }}
        >
          회원가입
        </Link>
      </div>
    );
  }

  const role = (user?.publicMetadata?.role as string | undefined) || "ATHLETE";
  const roleText = role === "MASTER" ? "마스터" : role === "ADMIN" ? "관리자" : role === "MANAGER" ? "운영자" : "선수";
  const avatarValue = user?.publicMetadata?.avatarValue as string | undefined;
  const avatarStyle = user?.publicMetadata?.avatarStyle as "shape" | "character" | undefined;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <UserAvatar 
        avatarValue={avatarValue}
        avatarStyle={avatarStyle}
        fallbackImageUrl={user?.imageUrl}
        size={32}
      />
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: "14px", fontWeight: 600, color: "#18181b" }}>
          {user?.fullName || user?.primaryEmailAddress?.emailAddress}
        </div>
        <div style={{ fontSize: "12px", color: "#71717a" }}>
          {roleText}
        </div>
      </div>
      <button
        onClick={() => signOut({ redirectUrl: "/" })}
        style={{
          padding: "8px 16px",
          borderRadius: "8px",
          background: "transparent",
          border: "1px solid #e4e4e7",
          color: "#52525b",
          cursor: "pointer",
          fontSize: "14px"
        }}
      >
        로그아웃
      </button>
    </div>
  );
}
