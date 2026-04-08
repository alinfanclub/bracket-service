import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "white" }}>
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        borderBottom: "1px solid #e4e4e7",
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)"
      }}>
        <div style={{ margin: "0 auto", maxWidth: "1280px", padding: "0 24px" }}>
          <div style={{
            display: "flex",
            height: "64px",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                display: "flex",
                height: "36px",
                width: "36px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "10px",
                background: "#18181b",
                fontSize: "16px"
              }}>
                🥋
              </div>
              <span style={{ fontSize: "18px", fontWeight: 700, color: "#18181b" }}>
                유도 대진표
              </span>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <Link
                href="/sign-in"
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: "transparent",
                  border: "1px solid #e4e4e7",
                  color: "#18181b",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 500
                }}
              >
                로그인
              </Link>
              <Link
                href="/sign-up"
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: "#18181b",
                  border: "none",
                  color: "white",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 500
                }}
              >
                시작하기
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section style={{
        padding: "120px 24px",
        textAlign: "center"
      }}>
        <div style={{ margin: "0 auto", maxWidth: "800px" }}>
          <div style={{
            display: "inline-flex",
            padding: "8px 16px",
            borderRadius: "9999px",
            background: "#f4f4f5",
            fontSize: "14px",
            color: "#52525b",
            marginBottom: "24px"
          }}>
            🏆 대회 운영의 새로운 기준
          </div>
          <h1 style={{
            fontSize: "56px",
            fontWeight: 800,
            lineHeight: 1.1,
            color: "#18181b",
            marginBottom: "24px",
            letterSpacing: "-0.025em"
          }}>
            유도 대회 운영을
            <br />
            더 쉽고 빠르게
          </h1>
          <p style={{
            fontSize: "20px",
            color: "#52525b",
            marginBottom: "40px",
            lineHeight: 1.6
          }}>
            선수 등록부터 대진표 생성, 경기 기록까지
            <br />
            한 곳에서 관리하는 스마트한 유도 대회 플랫폼
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <Link
              href="/sign-up"
              style={{
                padding: "16px 32px",
                borderRadius: "10px",
                background: "#18181b",
                color: "white",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: 600
              }}
            >
              물료로 시작하기
            </Link>
            <Link
              href="/public/JUDO26"
              style={{
                padding: "16px 32px",
                borderRadius: "10px",
                background: "white",
                border: "1px solid #e4e4e7",
                color: "#18181b",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: 600
              }}
            >
              샘플 대회 보기
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 24px", background: "#fafafa" }}>
        <div style={{ margin: "0 auto", maxWidth: "1280px" }}>
          <h2 style={{
            fontSize: "32px",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "64px",
            color: "#18181b"
          }}>
            주요 기능
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px"
          }}>
            {[
              {
                icon: "👥",
                title: "선수 관리",
                description: "소속 도장별 선수 등록 및 관리. 프로필 사진과 정보를 한눈에 확인하세요."
              },
              {
                icon: "🏆",
                title: "대회 생성",
                description: "몇 번의 클릭으로 대회 생성. 부문별 체급 설정도 간편하게."
              },
              {
                icon: "🎯",
                title: "자동 대진 생성",
                description: "싱글 엘리미네이션 대진표 자동 생성. 같은 도장 첫 경기 회피 기능 포함."
              },
              {
                icon: "⚡",
                title: "실시간 경기 기록",
                description: "기술별 득점 기록. 다음 라운드로 승자 자동 진출."
              },
              {
                icon: "📱",
                title: "공유 및 조회",
                description: "대회 코드나 공유 링크로 누구나 대진표 조회 가능."
              },
              {
                icon: "📊",
                title: "통계 및 기록",
                description: "개인별 경기 기록 및 통계 조회. 성장 추적에 활용하세요."
              }
            ].map((feature, index) => (
              <div
                key={index}
                style={{
                  padding: "32px",
                  borderRadius: "12px",
                  border: "1px solid #e4e4e7",
                  background: "white"
                }}
              >
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "#f4f4f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  marginBottom: "16px"
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  marginBottom: "8px",
                  color: "#18181b"
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: "14px",
                  color: "#52525b",
                  lineHeight: 1.6
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 24px" }}>
        <div style={{ margin: "0 auto", maxWidth: "1280px", textAlign: "center" }}>
          <h2 style={{
            fontSize: "32px",
            fontWeight: 700,
            marginBottom: "24px",
            color: "#18181b"
          }}>
            지금 바로 시작하세요
          </h2>
          <p style={{
            fontSize: "18px",
            color: "#52525b",
            marginBottom: "40px"
          }}>
            무료로 가입하고 첫 대회를 생성해보세요
          </p>
          <Link
            href="/sign-up"
            style={{
              padding: "16px 32px",
              borderRadius: "10px",
              background: "#18181b",
              color: "white",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: 600,
              display: "inline-block"
            }}
          >
            무료로 시작하기
          </Link>
        </div>
      </section>

      <footer style={{
        padding: "40px 24px",
        borderTop: "1px solid #e4e4e7",
        background: "#fafafa"
      }}>
        <div style={{ margin: "0 auto", maxWidth: "1280px", textAlign: "center" }}>
          <p style={{ fontSize: "14px", color: "#71717a" }}>
            © 2024 유도 대진표. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
