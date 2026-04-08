import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  children: ReactNode;
}

export const DashboardCard = ({ title, children }: DashboardCardProps) => {
  return (
    <section
      style={{
        borderRadius: "12px",
        border: "1px solid #e4e4e7",
        background: "white",
        padding: "24px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
      }}
    >
      <h2 style={{
        marginTop: 0,
        marginBottom: 12,
        fontSize: "16px",
        fontWeight: 600,
        color: "#18181b"
      }}>
        {title}
      </h2>
      <div style={{
        color: "#52525b",
        fontSize: "14px",
        lineHeight: 1.6
      }}>
        {children}
      </div>
    </section>
  );
};
