import { RoleShell } from "@judo-bracket/ui";

import { DashboardCard } from "../../../components/dashboard-card";

export default function AdminPage() {
  return (
    <RoleShell title="관리자" description="전체 대회 운영: 대회 설정, 대진표 생성, 결과 입력 및 공유 관리">
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
        <DashboardCard title="대회 관리">
          대회 생성, 부문 관리, 접근 코드 발급, 공유 링크 생성
        </DashboardCard>
        <DashboardCard title="대진표 운영">
          싱글 엘리미네이션 대진표 생성, 같은 도장 첫 경기 회피, 부전승 처리
        </DashboardCard>
        <DashboardCard title="경기 기록">
          기술별 득점 기록, 승자 입력, 자동 다음 라운드 진출 반영
        </DashboardCard>
        <DashboardCard title="출력 및 공유">
          출력용 대진표, 공개 읽기 전용 대회 공유
        </DashboardCard>
      </div>
    </RoleShell>
  );
}
