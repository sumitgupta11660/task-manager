import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)", display: "flex",
      alignItems: "center", justifyContent: "center", textAlign: "center",
    }}>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "96px", fontWeight: 800, color: "var(--border)", lineHeight: 1 }}>404</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", marginTop: "16px" }}>Page not found</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>This page doesn't exist</p>
        <button className="btn btn-primary" style={{ marginTop: "24px" }} onClick={() => navigate("/")}>
          Go Home
        </button>
      </div>
    </div>
  );
}
