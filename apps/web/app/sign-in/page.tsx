"use client";

import { SignIn } from "@clerk/nextjs";

import { RoleShell } from "@judo-bracket/ui";

export default function SignInPage() {
  return (
    <RoleShell title="로그인" description="대시보드에 접속하려면 로그인하세요">
      <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
        <SignIn 
          routing="hash"
          forceRedirectUrl="/auth/callback"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
              footerActionLink: "text-blue-600 hover:text-blue-700",
            },
          }}
        />
      </div>
    </RoleShell>
  );
}
