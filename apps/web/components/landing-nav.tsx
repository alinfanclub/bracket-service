"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";

import { roleHomeRoute } from "@judo-bracket/config";
import type { UserRole } from "@judo-bracket/types";

import { UserAvatar } from "./user-avatar";

export function LandingNav() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      width: "100%",
      borderBottom: "1px solid #e4e4e7",
      background: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(12px)"
    }}>
      <div style={{ margin: "0 auto", maxWidth: "1280px", padding: "0 24px" }}>
        <div style={{
          display: "flex",
          height: "64px",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <div style={{
              display: "flex",
              height: "36px",
              width: "36px",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "10px",
              background: "#18181b",
              fontSize: "16px"
            }}>
              🥋
            </div>
            <span style={{ fontSize: "18px", fontWeight: 700, color: "#18181b" }}>
              유도 대진표
            </span>
          </Link>

          {!isLoaded ? (
            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{
                width: "80px",
                height: "36px",
                borderRadius: "8px",
                background: "#f4f4f5"
              }} />
              <div style={{
                width: "80px",
                height: "36px",
                borderRadius: "8px",
                background: "#f4f4f5"
              }} />
            </div>
          ) : isSignedIn ? (
            <LoggedInUser />
          ) : (
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
                시작하기
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function LoggedInUser() {
  const { user } = useUser();
  const role = (user?.publicMetadata?.role as UserRole) || "ATHLETE";
  const dashboardRoute = roleHomeRoute[role];
  
  const roleText = role === "MASTER" ? "마스터" : role === "ADMIN" ? "관리자" : role === "MANAGER" ? "운영자" : "선수";
  const avatarValue = user?.publicMetadata?.avatarValue as string | undefined;
  const avatarStyle = user?.publicMetadata?.avatarStyle as "shape" | "character" | undefined;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <Link 
        href={dashboardRoute}
        style={{
          padding: "8px 16px",
          borderRadius: "8px",
          background: "#18181b",
          color: "white",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: 500
        }}
      >
        내 대시보드
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
      </div>
    </div>
  );
}
