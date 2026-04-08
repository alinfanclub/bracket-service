import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";

import { appName } from "@judo-bracket/config";

import "./globals.css";

export const metadata: Metadata = {
  title: appName,
  description: "유도 경기 대진표 및 경기 기록 관리 플랫폼"
};

const koreanLocalization = {
  backButton: "뒤로",
  badge__default: "기본",
  badge__otherImperative: "다른 방법으로 로그인",
  badge__primary: "주요",
  badge__requiresAction: "조치 필요",
  badge__thisDevice: "이 기기",
  badge__unverified: "미인증",
  badge__userDevice: "사용자 기기",
  badge__you: "나",
  formFieldAction__forgotPassword: "비밀번호를 잊으셨나요?",
  formFieldError__matchingPasswords: "비밀번호가 일치합니다.",
  formFieldError__notMatchingPasswords: "비밀번호가 일치하지 않습니다.",
  formFieldHintText__optional: "선택사항",
  formFieldInputPlaceholder__emailAddress: "이메일 주소 입력",
  formFieldInputPlaceholder__password: "비밀번호 입력",
  formFieldLabel__emailAddress: "이메일",
  formFieldLabel__password: "비밀번호",
  formButtonPrimary: "계속",
  signIn: {
    start: {
      title: "로그인",
      subtitle: "계정에 로그인하세요",
      actionText: "계정이 없으신가요?",
      actionLink: "회원가입",
    },
    password: {
      title: "비밀번호 입력",
      subtitle: "계정에 연결된 비밀번호를 입력하세요",
      actionLink: "다른 방법 사용",
    },
    forgotPassword: {
      title: "비밀번호 재설정",
      subtitle: "계정에 연결된 이메일을 입력하세요.",
      formTitle: "재설정 코드",
      formSubtitle: "재설정 코드를 입력하세요",
      resendButton: "코드 다시 받기",
    },
    resetPassword: {
      title: "비밀번호 재설정",
      subtitle: "비밀번호를 변경하세요",
      formButtonPrimary: "비밀번호 재설정",
      successMessage: "비밀번호가 성공적으로 변경되었습니다.",
    },
  },
  signUp: {
    start: {
      title: "회원가입",
      subtitle: "새 계정을 만드세요",
      actionText: "이미 계정이 있으신가요?",
      actionLink: "로그인",
    },
    emailLink: {
      title: "이메일 인증",
      subtitle: "이메일로 전송된 링크를 확인하세요",
      formTitle: "인증 링크",
      formSubtitle: "이메일의 인증 링크를 클릭하세요",
      resendButton: "링크 다시 받기",
    },
    emailCode: {
      title: "이메일 인증",
      subtitle: "이메일로 전송된 인증 코드를 입력하세요",
      formTitle: "인증 코드",
      formSubtitle: "이메일의 인증 코드를 입력하세요",
      resendButton: "코드 다시 받기",
    },
  },
  socialButtonsBlockButton: "{{provider|titleize}}로 계속",
  dividerText: "또는",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      localization={koreanLocalization}
      appearance={{
        elements: {
          formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
          footerActionLink: "text-blue-600 hover:text-blue-700"
        }
      }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
    >
      <html lang="ko">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
