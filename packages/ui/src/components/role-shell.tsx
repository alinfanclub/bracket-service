import type { ReactNode } from "react";

export interface RoleShellProps {
  title: string;
  description: string;
  children: ReactNode;
  headerActions?: ReactNode;
}

export const RoleShell = ({ title, description, children, headerActions }: RoleShellProps) => {
  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      <header style={{
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
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                display: "flex",
                height: "40px",
                width: "40px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "10px",
                background: "#18181b",
                fontSize: "18px",
                color: "white"
              }}>
                🥋
              </div>
              <div>
                <h1 style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#18181b",
                  margin: 0
                }}>
                  {title}
                </h1>
                <p style={{
                  fontSize: "14px",
                  color: "#71717a",
                  margin: 0
                }}>
                  {description}
                </p>
              </div>
            </div>
            {headerActions && <div>{headerActions}</div>}
          </div>
        </div>
      </header>
      <main style={{ margin: "0 auto", maxWidth: "1280px", padding: "32px 24px" }}>
        {children}
      </main>
    </div>
  );
};
