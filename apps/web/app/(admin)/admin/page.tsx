"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

import { RoleShell } from "@judo-bracket/ui";
import type { DivisionRecord, TournamentSummary } from "@judo-bracket/types";

import { DashboardCard } from "../../../components/dashboard-card";
import { generateBracket } from "../../../lib/api";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL ?? "http://localhost:4000/api";

interface TournamentWithDivisions extends TournamentSummary {
  divisions: DivisionRecord[];
}

export default function AdminPage() {
  const { getToken } = useAuth();
  const [tournaments, setTournaments] = useState<TournamentWithDivisions[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTournaments() {
      try {
        const token = await getToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${apiBaseUrl}/tournaments`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTournaments(data);
        }
      } catch (error) {
        console.error("Failed to fetch tournaments:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTournaments();
  }, [getToken]);

  const handleGenerateBracket = async (divisionId: string) => {
    setGenerating(divisionId);
    setMessage(null);

    try {
      const token = await getToken();
      if (!token) {
        setMessage("인증 토큰을 가져올 수 없습니다.");
        return;
      }

      const result = await generateBracket(divisionId, token);
      
      if (result.status === "success") {
        setMessage(`대진표가 성공적으로 생성되었습니다! (${result.data.matches.length}경기)`);
      } else if (result.status === "not_found") {
        setMessage("해당 부문을 찾을 수 없습니다.");
      } else {
        setMessage("대진표 생성에 실패했습니다. 참가자가 등록되어 있는지 확인해주세요.");
      }
    } catch (error) {
      console.error("Failed to generate bracket:", error);
      setMessage("대진표 생성 중 오류가 발생했습니다.");
    } finally {
      setGenerating(null);
    }
  };

  return (
    <RoleShell title="관리자" description="전체 대회 운영: 대회 설정, 대진표 생성, 결과 입력 및 공유 관리">
      <div style={{ display: "grid", gap: 16 }}>
        {message && (
          <div style={{
            padding: "12px 16px",
            borderRadius: "8px",
            background: message.includes("성공") ? "#dcfce7" : "#fef2f2",
            border: `1px solid ${message.includes("성공") ? "#86efac" : "#fecaca"}`,
            color: message.includes("성공") ? "#166534" : "#991b1b"
          }}>
            {message}
          </div>
        )}

        <DashboardCard title="대회 목록">
          {loading ? (
            <div style={{ color: "#71717a" }}>대회 목록을 불러오는 중...</div>
          ) : tournaments.length === 0 ? (
            <div style={{ color: "#71717a" }}>등록된 대회가 없습니다.</div>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              {tournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid #e4e4e7",
                    background: "#fafafa"
                  }}
                >
                  <div style={{ marginBottom: 12 }}>
                    <strong style={{ fontSize: 16, color: "#18181b" }}>{tournament.name}</strong>
                    <div style={{ fontSize: 12, color: "#71717a", marginTop: 4 }}>
                      {tournament.code} · {tournament.venue} · {tournament.status}
                    </div>
                  </div>

                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#52525b" }}>
                    부문 목록
                  </div>
                  
                  {tournament.divisions.length === 0 ? (
                    <div style={{ fontSize: 14, color: "#71717a" }}>등록된 부문이 없습니다.</div>
                  ) : (
                    <div style={{ display: "grid", gap: 8 }}>
                      {tournament.divisions.map((division) => (
                        <div
                          key={division.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px",
                            borderRadius: "6px",
                            background: "white",
                            border: "1px solid #e4e4e7"
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 500, color: "#18181b" }}>{division.name}</div>
                            <div style={{ fontSize: 12, color: "#71717a" }}>
                              {division.gender} · {division.ageGroup} · {division.weightClass}
                            </div>
                          </div>
                          <button
                            onClick={() => handleGenerateBracket(division.id)}
                            disabled={generating === division.id}
                            style={{
                              padding: "8px 16px",
                              borderRadius: "6px",
                              background: generating === division.id ? "#a1a1aa" : "#18181b",
                              color: "white",
                              border: "none",
                              fontSize: 14,
                              fontWeight: 500,
                              cursor: generating === division.id ? "not-allowed" : "pointer"
                            }}
                          >
                            {generating === division.id ? "생성 중..." : "대진표 생성"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
          <DashboardCard title="대회 관리">
            대회 생성, 부문 관리, 접근 코드 발급, 공유 링크 생성
          </DashboardCard>
          <DashboardCard title="경기 기록">
            기술별 득점 기록, 승자 입력, 자동 다음 라운드 진출 반영
          </DashboardCard>
          <DashboardCard title="출력 및 공유">
            출력용 대진표, 공개 읽기 전용 대회 공유
          </DashboardCard>
        </div>
      </div>
    </RoleShell>
  );
}
