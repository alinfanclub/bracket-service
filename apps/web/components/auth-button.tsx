"use client";

import { UserButton } from "@clerk/nextjs";

export function AuthButton() {
  return (
    <UserButton
      appearance={{
        elements: {
          userButtonAvatarBox: "w-8 h-8"
        }
      }}
    />
  );
}
