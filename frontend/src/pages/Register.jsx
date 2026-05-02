import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.username || !form.email || !form.password) { setError("All fields required"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    setError("");
    try {
      await register(form.username, form.email, form.password);
      navigate("/login");
    } catch (e) {
      setError(e.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at 40% 80%, rgba(124,111,255,0.06) 0%, transparent 60%), var(--bg)",
      padding: "20px",
    }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "36px", fontWeight: 800 }}>
            Task<span style={{ color: "var(--accent)" }}>Flow</span>
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>Start managing your team</p>
        </div>

        <div className="card" style={{ padding: "32px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, marginBottom: "24px" }}>
            Create account
          </h2>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="input" placeholder="sumitgupta" value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="input" type="email" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="input" type="password" placeholder="Min 6 characters"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          </div>

          {error && <p className="form-error" style={{ marginBottom: "16px" }}>{error}</p>}

          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}
            onClick={handleSubmit} disabled={loading}>
            {loading ? <><span className="spinner" /> Creating...</> : "Create Account"}
          </button>

          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--accent)", fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
