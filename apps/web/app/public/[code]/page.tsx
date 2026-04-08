import { notFound } from "next/navigation";

import { RoleShell } from "@judo-bracket/ui";

import { DashboardCard } from "../../../components/dashboard-card";
import { getPublicTournamentViewByCode } from "../../../lib/api";

export default async function PublicTournamentPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const tournament = await getPublicTournamentViewByCode(code.toUpperCase());

  if (tournament.status === "not_found") {
    notFound();
  }

  if (tournament.status === "error") {
    return (
      <RoleShell title="대회를 불러올 수 없음" description="현재 대회 데이터를 불러올 수 없습니다">
        <DashboardCard title="일시적인 문제">잠시 후 다시 대회 링크에 접속해주세요</DashboardCard>
      </RoleShell>
    );
  }

  const data = tournament.data;

  return (
    <RoleShell title={data.tournament?.name ?? "대회"} description="공개 읽기 전용 대진표 및 진행 상황">
      <div style={{ display: "grid", gap: 16 }}>
        <DashboardCard title="대회 상태">
          {data.tournament?.status} · {data.tournament?.venue}
        </DashboardCard>
        <DashboardCard title="참가자">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {data.entries.map((entry) => (
              <li key={entry.id}>
                {entry.athleteName} · {entry.organizationName}
              </li>
            ))}
          </ul>
        </DashboardCard>
        <DashboardCard title="대진표 미리보기">
          <div style={{ display: "grid", gap: 12 }}>
            {data.divisions.map((division) => {
              const bracket = data.brackets.find((item) => item.divisionId === division.id);
              return (
                <div key={division.id}>
                  <strong>{division.name}</strong>
                  <ul style={{ marginBottom: 0, paddingLeft: 18 }}>
                    {(bracket?.matches ?? []).map((match) => (
                      <li key={match.id}>
                        R{match.roundNumber} M{match.matchNumber}: {match.homeAthleteName} vs {match.awayAthleteName} · {match.status}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </DashboardCard>
      </div>
    </RoleShell>
  );
}
