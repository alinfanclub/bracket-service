import Link from "next/link";

import { RoleShell } from "@judo-bracket/ui";

import { HeaderAuth } from "../../components/header-auth";

const roles = [
  { 
    role: "ADMIN", 
    label: "관리자", 
    description: "대회 생성, 대진표 관리, 결과 입력 등 전체 운영 권한",
    color: "#ff6b00",
    icon: "👑"
  },
  { 
    role: "MANAGER", 
    label: "운영자", 
    description: "소속 선수 관리, 대회 참가 신청 등 소속별 운영 권한",
    color: "#00ff88",
    icon: "🎯"
  },
  { 
    role: "ATHLETE", 
    label: "선수", 
    description: "개인 경기 기록 조회, 참가 대회 확인 등 개인 서비스",
    color: "#00d4ff",
    icon: "🥋"
  }
];

export default function RoleSelectPage() {
  return (
    <RoleShell 
      title="회원가입" 
      description="가입할 역할을 선택하세요"
      headerActions={<HeaderAuth />}
    >
      <div style={{ 
        display: "grid", 
        gap: 24, 
        maxWidth: 640, 
        margin: "40px auto",
        padding: "0 20px"
      }}>
        <div style={{
          textAlign: "center",
          marginBottom: 20
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #ff6b00, #ff8533)",
            margin: "0 auto 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
            boxShadow: "0 4px 30px rgba(255, 107, 0, 0.4)"
          }}>
            🥋
          </div>
          <h2 style={{
            fontSize: 28,
            fontWeight: 800,
            margin: "0 0 12px 0",
            color: "#ffffff"
          }}>
            역할 선택
          </h2>
          <p style={{
            color: "#a0a0a0",
            margin: 0,
            fontSize: 16
          }}>
            가입할 역할을 선택해주세요
          </p>
        </div>

        {roles.map(({ role, label, description, color, icon }) => (
          <Link
            key={role}
            href={`/sign-up/form?role=${role}`}
            style={{
              display: "block",
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              borderRadius: 20,
              border: `2px solid ${color}44`,
              padding: 28,
              textDecoration: "none",
              color: "inherit",
              transition: "all 0.3s ease",
              boxShadow: `0 4px 20px ${color}22`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div 
                style={{ 
                  width: 64, 
                  height: 64, 
                  borderRadius: 16, 
                  background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  boxShadow: `0 4px 20px ${color}66`
                }}
              >
                {icon}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ 
                  margin: "0 0 8px 0", 
                  fontSize: 22, 
                  color: "#ffffff",
                  fontWeight: 700
                }}>
                  {label}
                </h2>
                <p style={{ margin: 0, color: "#a0a0a0", fontSize: 14, lineHeight: 1.5 }}>
                  {description}
                </p>
              </div>
              <div style={{ 
                fontSize: 28, 
                color: color,
                fontWeight: 300
              }}>
                →
              </div>
            </div>
          </Link>
        ))}
        
        <div style={{ 
          textAlign: "center", 
          marginTop: 20, 
          padding: 24, 
          background: "rgba(255, 255, 255, 0.05)", 
          borderRadius: 16,
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          <p style={{ margin: 0, color: "#a0a0a0", fontSize: 15 }}>
            이미 계정이 있으신가요? <Link href="/sign-in" style={{ 
              color: "#ff6b00", 
              textDecoration: "none", 
              fontWeight: 700 
            }}>로그인</Link>
          </p>
        </div>
      </div>
    </RoleShell>
  );
}
