import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { RoleShell } from "@judo-bracket/ui";

import { HeaderAuth } from "../../components/header-auth";
import { getCurrentUserRole } from "../../lib/auth-context";

async function checkAdminAccess() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const role = await getCurrentUserRole();

  if (role !== "MASTER" && role !== "ADMIN") {
    redirect("/");
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await checkAdminAccess();

  return (
    <RoleShell
      title="관리자"
      description="대회 운영 및 관리"
      headerActions={<HeaderAuth />}
    >
      {children}
    </RoleShell>
  );
}
