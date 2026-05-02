import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate("/login");
  };

  return (
    <nav style={{
      background: "var(--bg-card)",
      borderBottom: "1px solid var(--border-subtle)",
      padding: "0 32px",
      height: "60px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <span
        onClick={() => navigate("/")}
        style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "20px", cursor: "pointer", color: "var(--text)" }}
      >
        Task<span style={{ color: "var(--accent)" }}>Flow</span>
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          background: "var(--bg-elevated)", padding: "6px 14px",
          borderRadius: "20px", border: "1px solid var(--border)"
        }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: "var(--accent-dim)", border: "1px solid var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: 700, color: "var(--accent)"
          }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>@{user?.username}</span>
        </div>

        <button
          className="btn btn-ghost btn-sm"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? <span className="spinner" /> : "Logout"}
        </button>
      </div>
    </nav>
  );
}
