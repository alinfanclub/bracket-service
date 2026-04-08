import { RoleShell } from "@judo-bracket/ui";

import { HeaderAuth } from "../../components/header-auth";
import { requireRole } from "../../lib/auth-context";

export default async function MasterLayout({ children }: { children: React.ReactNode }) {
  await requireRole("MASTER");

  return (
    <RoleShell
      title="마스터 관리"
      description="시스템 전체 관리 및 사용자 권한 설정"
      headerActions={<HeaderAuth />}
    >
      {children}
    </RoleShell>
  );
}
