import { RoleShell } from "@judo-bracket/ui";

import { DashboardCard } from "../../../components/dashboard-card";
import { getAthleteHistory } from "../../../lib/api";
import { resolveCurrentAthleteId } from "../../../lib/auth-context";

export default async function AthletePage() {
  const athleteId = await resolveCurrentAthleteId();
  const athleteHistory = athleteId ? await getAthleteHistory(athleteId) : null;

  if (!athleteId || athleteHistory?.status === "not_found") {
    return (
      <RoleShell title="선수" description="참가 이력 및 경기 기록 조회">
        <DashboardCard title="선수 프로필 연결 필요">
          경기 기록을 조회하려면 선수 프로필이 연결되어 있어야 합니다.
        </DashboardCard>
      </RoleShell>
    );
  }

  if (!athleteHistory || athleteHistory.status === "error") {
    return (
      <RoleShell title="선수" description="참가 이력 및 경기 기록 조회">
        <DashboardCard title="일시적으로 조회할 수 없음">
          현재 경기 기록을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.
        </DashboardCard>
      </RoleShell>
    );
  }

  const data = athleteHistory.data;

  return (
    <RoleShell title="선수" description="참가 이력 및 경기 기록 조회">
      <div style={{ display: "grid", gap: 16 }}>
        <DashboardCard title="내 대회">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {Array.from(new Set(data.matches.map((match) => `${match.tournamentName} · ${match.divisionName}`))).map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </DashboardCard>
        <DashboardCard title="내 경기 기록">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {data.matches.map((match) => (
              <li key={match.id}>
                {match.tournamentName} / {match.divisionName} · R{match.roundNumber} M{match.matchNumber}: {match.homeAthleteName} vs {match.awayAthleteName} · {match.status}
              </li>
            ))}
          </ul>
        </DashboardCard>
        <DashboardCard title="기술별 득점">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {data.matches.flatMap((match) => match.scoreEvents.map((event) => ({ event, match }))).map(({ event, match }) => (
              <li key={event.id}>
                {match.tournamentName} · R{match.roundNumber} M{match.matchNumber} · {event.eventType} · {event.technique} · {event.occurredAtSeconds}초
              </li>
            ))}
          </ul>
        </DashboardCard>
      </div>
    </RoleShell>
  );
}
