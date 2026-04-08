import { RoleShell } from "@judo-bracket/ui";

import { DashboardCard } from "../../../../components/dashboard-card";

export default async function PublicShareLinkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <RoleShell title="공유된 대진표" description="발급된 공유 링크로 접속한 읽기 전용 페이지">
      <DashboardCard title="공유 링크">{slug}</DashboardCard>
    </RoleShell>
  );
}
