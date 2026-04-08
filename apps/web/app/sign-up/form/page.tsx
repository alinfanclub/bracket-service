"use client";

import { useState, Suspense } from "react";
import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import Avvvatars from "avvvatars-react";

import { RoleShell } from "@judo-bracket/ui";

const avatarOptions = [
  { id: "avatar1", value: "user1@judo.com", style: "shape" as const, color: "#ff6b00" },
  { id: "avatar2", value: "user2@judo.com", style: "shape" as const, color: "#00ff88" },
  { id: "avatar3", value: "user3@judo.com", style: "shape" as const, color: "#00d4ff" },
  { id: "avatar4", value: "user4@judo.com", style: "shape" as const, color: "#ff00ff" },
  { id: "avatar5", value: "user5@judo.com", style: "shape" as const, color: "#ffff00" },
  { id: "avatar6", value: "user6@judo.com", style: "shape" as const, color: "#ff4757" },
  { id: "avatar7", value: "user7@judo.com", style: "character" as const, color: "#ff6b00" },
  { id: "avatar8", value: "user8@judo.com", style: "character" as const, color: "#00ff88" },
  { id: "avatar9", value: "user9@judo.com", style: "character" as const, color: "#00d4ff" },
  { id: "avatar10", value: "user10@judo.com", style: "character" as const, color: "#ff00ff" },
  { id: "avatar11", value: "user11@judo.com", style: "character" as const, color: "#ffff00" },
  { id: "avatar12", value: "user12@judo.com", style: "character" as const, color: "#ff4757" },
];

function SignUpFormContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "ATHLETE";
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [step, setStep] = useState<"avatar" | "form">("avatar");
  
  const roleText = role === "ADMIN" ? "관리자" : role === "MANAGER" ? "운영자" : "선수";
  const roleColor = role === "ADMIN" ? "#ff6b00" : role === "MANAGER" ? "#00ff88" : "#00d4ff";

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
  };

  const handleContinue = () => {
    if (selectedAvatar) {
      setStep("form");
    }
  };

  if (step === "avatar") {
    return (
      <RoleShell title={`${roleText} 회원가입`} description="프로필 이미지를 선택하세요">
        <div style={{ 
          maxWidth: 640, 
          margin: "0 auto", 
          padding: "40px 20px"
        }}>
          <div style={{
            textAlign: "center",
            marginBottom: 40
          }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${roleColor}, ${roleColor}88)`,
              margin: "0 auto 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              boxShadow: `0 4px 30px ${roleColor}66`
            }}>
              🥋
            </div>
            <h2 style={{
              fontSize: 28,
              fontWeight: 800,
              margin: "0 0 12px 0",
              color: "#ffffff"
            }}>
              프로필 이미지 선택
            </h2>
            <p style={{
              color: "#a0a0a0",
              margin: 0,
              fontSize: 16
            }}>
              {roleText}로 사용할 프로필 이미지를 선택해주세요
            </p>
          </div>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(4, 1fr)", 
            gap: 20,
            marginBottom: 40
          }}>
            {avatarOptions.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => handleAvatarSelect(avatar.id)}
                style={{
                  padding: 20,
                  border: selectedAvatar === avatar.id 
                    ? `3px solid ${avatar.color}` 
                    : "2px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 16,
                  background: selectedAvatar === avatar.id 
                    ? `${avatar.color}22`
                    : "rgba(255, 255, 255, 0.05)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  transition: "all 0.3s ease",
                  position: "relative"
                }}
              >
                <Avvvatars 
                  value={avatar.value} 
                  style={avatar.style}
                  size={72}
                  shadow={true}
                />
                {selectedAvatar === avatar.id && (
                  <span style={{ 
                    fontSize: 12, 
                    color: avatar.color,
                    fontWeight: 700
                  }}>
                    선택됨
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleContinue}
            disabled={!selectedAvatar}
            style={{
              width: "100%",
              padding: "18px",
              borderRadius: 12,
              background: selectedAvatar 
                ? `linear-gradient(135deg, ${roleColor}, ${roleColor}dd)` 
                : "rgba(255, 255, 255, 0.1)",
              border: "none",
              color: "white",
              fontSize: 18,
              fontWeight: 700,
              cursor: selectedAvatar ? "pointer" : "not-allowed",
              boxShadow: selectedAvatar ? `0 4px 20px ${roleColor}66` : "none",
              transition: "all 0.3s ease"
            }}
          >
            계속하기
          </button>
        </div>
      </RoleShell>
    );
  }

  const selectedAvatarData = avatarOptions.find(a => a.id === selectedAvatar);

  return (
    <RoleShell title={`${roleText} 회원가입`} description={`${roleText}로 새 계정을 만드세요`}>
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        padding: "40px 20px"
      }}>
        {selectedAvatarData && (
          <div style={{ 
            marginBottom: 32, 
            textAlign: "center",
            padding: 24,
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: 20,
            border: `2px solid ${selectedAvatarData.color}66`
          }}>
            <p style={{ marginBottom: 16, color: "#a0a0a0", fontSize: 14 }}>
              선택한 프로필
            </p>
            <Avvvatars 
              value={selectedAvatarData.value} 
              style={selectedAvatarData.style}
              size={100}
              shadow={true}
            />
          </div>
        )}
        
        <div style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 20,
          padding: 40,
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
          maxWidth: 480,
          width: "100%"
        }}>
          <SignUp 
            routing="hash"
            unsafeMetadata={{ 
              role,
              avatarId: selectedAvatar,
              avatarValue: selectedAvatarData?.value,
              avatarStyle: selectedAvatarData?.style
            }}
            appearance={{
              elements: {
                formButtonPrimary: {
                  background: `linear-gradient(135deg, ${roleColor}, ${roleColor}dd)`,
                  border: "none",
                  boxShadow: `0 4px 15px ${roleColor}66`
                },
                footerActionLink: {
                  color: roleColor
                },
                card: {
                  background: "transparent",
                  border: "none",
                  boxShadow: "none"
                },
                formFieldInput: {
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#ffffff"
                },
                formFieldLabel: {
                  color: "#a0a0a0"
                },
                headerTitle: {
                  color: "#ffffff"
                },
                headerSubtitle: {
                  color: "#a0a0a0"
                }
              }
            }}
          />
        </div>
      </div>
    </RoleShell>
  );
}

function LoadingFallback() {
  return (
    <RoleShell title="회원가입" description="로딩 중...">
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        minHeight: "400px"
      }}>
        <div style={{
          width: 48,
          height: 48,
          border: "3px solid rgba(255, 255, 255, 0.1)",
          borderTop: "3px solid #00d4ff",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </RoleShell>
  );
}

export default function SignUpFormPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SignUpFormContent />
    </Suspense>
  );
}
