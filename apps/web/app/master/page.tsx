import Link from "next/link";

import { DashboardCard } from "../../components/dashboard-card";

export default function MasterPage() {
  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(2, 1fr)" }}>
      <Link href="/master/users" style={{ textDecoration: "none" }}>
        <DashboardCard title="사용자 관리">
          <p style={{ margin: 0, color: "#6b7280" }}>
            가입된 사용자 조회 및 권한 변경
          </p>
        </DashboardCard>
      </Link>
      
      <DashboardCard title="시스템 설정">
        <p style={{ margin: 0, color: "#6b7280" }}>
          전역 설정 및 시스템 관리
        </p>
      </DashboardCard>
      
      <DashboardCard title="조직 관리">
        <p style={{ margin: 0, color: "#6b7280" }}>
          도장/학교/클�브 관리
        </p>
      </DashboardCard>
      
      <DashboardCard title="로그 및 통계">
        <p style={{ margin: 0, color: "#6b7280" }}>
          시스템 사용 현황 및 로그
        </p>
      </DashboardCard>
    </div>
  );
}
