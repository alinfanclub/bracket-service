import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { RoleShell } from "@judo-bracket/ui";

import { HeaderAuth } from "../../components/header-auth";
import { getCurrentUserRole } from "../../lib/auth-context";

async function checkManagerAccess() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const role = await getCurrentUserRole();

  if (role !== "MASTER" && role !== "ADMIN" && role !== "MANAGER") {
    redirect("/");
  }
}

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  await checkManagerAccess();

  return (
    <RoleShell
      title="운영자"
      description="소속 관리 및 대회 운영"
      headerActions={<HeaderAuth />}
    >
      {children}
    </RoleShell>
  );
}
