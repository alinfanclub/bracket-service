import Link from "next/link";

import { DashboardCard } from "../../../components/dashboard-card";
import { UserAvatar } from "../../../components/user-avatar";

interface ClerkUser {
  id: string;
  emailAddresses: Array<{ emailAddress: string }>;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  createdAt: number;
  publicMetadata: { 
    role?: string;
    avatarValue?: string;
    avatarStyle?: "shape" | "character";
  };
}

async function getClerkUsers(): Promise<ClerkUser[]> {
  try {
    const response = await fetch("https://api.clerk.com/v1/users", {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      console.error("Failed to fetch users:", await response.text());
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export default async function MasterUsersPage() {
  const users = await getClerkUsers();

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <DashboardCard title="사용자 관리">
        <div style={{ marginBottom: 16 }}>
          <p style={{ margin: 0, color: "#6b7280" }}>
            총 {users.length}명의 사용자가 등록되어 있습니다.
          </p>
        </div>
        
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 14 }}>프로필</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 14 }}>이름</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 14 }}>이메일</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 14 }}>역할</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 14 }}>가입일</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 14 }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const role = user.publicMetadata?.role || "ATHLETE";
                const roleText = role === "MASTER" ? "마스터" : role === "ADMIN" ? "관리자" : role === "MANAGER" ? "운영자" : "선수";
                const roleColor = role === "MASTER" ? "#7c3aed" : role === "ADMIN" ? "#dc2626" : role === "MANAGER" ? "#ea580c" : "#16a34a";
                const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString("ko-KR") : "-";
                const email = user.emailAddresses?.[0]?.emailAddress || "이메일 없음";
                const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "이름 없음";

                return (
                  <tr key={user.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <UserAvatar 
                        avatarValue={user.publicMetadata?.avatarValue}
                        avatarStyle={user.publicMetadata?.avatarStyle}
                        fallbackImageUrl={user.imageUrl}
                        size={40}
                      />
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {fullName}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14 }}>
                      {email}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: 12,
                        background: `${roleColor}20`,
                        color: roleColor,
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        {roleText}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#6b7280" }}>
                      {joinDate}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Link
                        href={`/master/users/${user.id}`}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 6,
                          background: "#3b82f6",
                          color: "white",
                          textDecoration: "none",
                          fontSize: 12
                        }}
                      >
                        수정
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  );
}
