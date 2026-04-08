import { RoleShell } from "@judo-bracket/ui";

import { DashboardCard } from "../../../components/dashboard-card";

export default function ManagerPage() {
  return (
    <RoleShell title="운영자" description="소속 범위 내 선수 관리 및 대회 참가 신청">
      <div style={{ display: "grid", gap: 16 }}>
        <DashboardCard title="소속 선수 관리">
          학교, 도장, 클럽 범위 내 선수 등록, 수정, 삭제
        </DashboardCard>
        <DashboardCard title="대회 참가 신청">
          소속 선수의 대회 부문별 참가 신청
        </DashboardCard>
      </div>
    </RoleShell>
  );
}
