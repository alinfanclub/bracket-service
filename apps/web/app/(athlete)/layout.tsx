import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { RoleShell } from "@judo-bracket/ui";

import { HeaderAuth } from "../../components/header-auth";

async function checkAuth() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }
}

export default async function AthleteLayout({ children }: { children: React.ReactNode }) {
  await checkAuth();

  return (
    <RoleShell
      title="선수"
      description="개인 기록 조회"
      headerActions={<HeaderAuth />}
    >
      {children}
    </RoleShell>
  );
}
