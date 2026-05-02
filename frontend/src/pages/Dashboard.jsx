import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import CreateProjectModal from "../components/CreateProjectModal";
import api from "../api/axios";

const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function ProjectCard({ project, myRole, onClick }) {
  const memberCount = project.members?.length || 0;

  return (
    <div onClick={onClick} style={{
      background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius)", padding: "24px", cursor: "pointer",
      transition: "all 0.2s", position: "relative", overflow: "hidden",
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(124,111,255,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-subtle)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px",
        background: myRole === "admin" ? "var(--accent)" : "var(--border)" }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 700, color: "var(--text)" }}>
          {project.name}
        </h3>
        <span className={`badge badge-${myRole}`}>{myRole}</span>
      </div>

      {project.description && (
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px", lineHeight: 1.5 }}>
          {project.description.length > 80 ? project.description.slice(0, 80) + "…" : project.description}
        </p>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
        <div style={{ display: "flex", gap: "4px" }}>
          {project.members?.slice(0, 4).map((m, i) => (
            <div key={i} style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: "var(--bg-elevated)", border: "2px solid var(--bg-card)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", fontWeight: 700, color: "var(--text-muted)",
              marginLeft: i > 0 ? "-8px" : 0,
            }}>
              {m.user?.username?.[0]?.toUpperCase()}
            </div>
          ))}
          {memberCount > 4 && (
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: "var(--bg-elevated)", border: "2px solid var(--bg-card)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "10px", color: "var(--text-muted)", marginLeft: "-8px",
            }}>+{memberCount - 4}</div>
          )}
        </div>
        <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>{formatDate(project.createdAt)}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.get("/projects")
      .then((res) => setProjects(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getMyRole = (project) => {
    const me = project.members?.find((m) => m.user?._id === user?._id);
    return me?.role || "member";
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 800 }}>
              My Projects
            </h1>
            <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
              {projects.length} project{projects.length !== 1 ? "s" : ""} — create or join to get started
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + New Project
          </button>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "40px" }}>
          {[
            { label: "Total Projects", value: projects.length, color: "var(--accent)" },
            { label: "As Admin", value: projects.filter(p => getMyRole(p) === "admin").length, color: "var(--green)" },
            { label: "As Member", value: projects.filter(p => getMyRole(p) === "member").length, color: "var(--blue)" },
          ].map((s) => (
            <div key={s.label} className="card" style={{ padding: "20px 24px" }}>
              <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-display)", color: s.color }}>
                {s.value}
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
            <div className="spinner spinner-lg" />
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No projects yet</div>
            <p>Create your first project and invite your team</p>
            <button className="btn btn-primary" style={{ marginTop: "20px" }} onClick={() => setShowModal(true)}>
              + Create Project
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {projects.map((p) => (
              <ProjectCard key={p._id} project={p} myRole={getMyRole(p)}
                onClick={() => navigate(`/projects/${p._id}`)} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreated={(p) => setProjects((prev) => [p, ...prev])}
        />
      )}
    </div>
  );
}
