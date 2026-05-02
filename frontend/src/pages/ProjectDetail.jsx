import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import CreateTaskModal from "../components/CreateTaskModal";
import AddMemberModal from "../components/AddMemberModal";
import api from "../api/axios";

const STATUS_LABELS = { todo: "To Do", in_progress: "In Progress", completed: "Completed" };
const PRIORITY_COLORS = { low: "var(--text-muted)", medium: "var(--yellow)", high: "var(--red)" };
const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : null;
const isOverdue = (d, status) => d && status !== "completed" && new Date(d) < new Date();

function TaskCard({ task, myRole, onStatusChange, onDelete }) {
  const [updating, setUpdating] = useState(false);
  const overdue = isOverdue(task.dueDate, task.status);

  const cycleStatus = async () => {
    const order = ["todo", "in_progress", "completed"];
    const next = order[(order.indexOf(task.status) + 1) % order.length];
    setUpdating(true);
    try { await onStatusChange(task._id, next); }
    finally { setUpdating(false); }
  };

  return (
    <div style={{
      background: "var(--bg-elevated)", border: `1px solid ${overdue ? "rgba(248,113,113,0.3)" : "var(--border-subtle)"}`,
      borderRadius: "var(--radius-sm)", padding: "16px", transition: "border-color 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <button onClick={cycleStatus} disabled={updating} style={{
          width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0, marginTop: "2px",
          border: `2px solid ${task.status === "completed" ? "var(--green)" : "var(--border)"}`,
          background: task.status === "completed" ? "var(--green)" : "transparent",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
        }}>
          {task.status === "completed" && <span style={{ color: "#000", fontSize: "10px", fontWeight: 700 }}>✓</span>}
          {updating && <span className="spinner" style={{ width: "12px", height: "12px" }} />}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
            <span style={{
              fontSize: "14px", fontWeight: 500,
              color: task.status === "completed" ? "var(--text-dim)" : "var(--text)",
              textDecoration: task.status === "completed" ? "line-through" : "none",
            }}>{task.title}</span>
            <span className={`badge badge-${task.status}`}>{STATUS_LABELS[task.status]}</span>
          </div>

          {task.description && (
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>
              {task.description}
            </p>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <span className={`badge badge-${task.priority}`}>{task.priority}</span>

            {task.assignedTo && (
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                👤 @{task.assignedTo.username}
              </span>
            )}

            {task.dueDate && (
              <span style={{ fontSize: "12px", color: overdue ? "var(--red)" : "var(--text-dim)" }}>
                {overdue ? "⚠ " : "📅 "}{formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>

        {myRole === "admin" && (
          <button onClick={() => onDelete(task._id)} style={{
            background: "none", color: "var(--text-dim)", fontSize: "16px",
            padding: "2px 6px", borderRadius: "4px", transition: "color 0.2s",
          }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--red)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-dim)"}
          >×</button>
        )}
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("tasks"); // tasks | members | dashboard
  const [filter, setFilter] = useState({ status: "", priority: "" });
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const myRole = project?.members?.find((m) => m.user?._id === user?._id)?.role || "member";
  const isAdmin = myRole === "admin";

  const fetchAll = async () => {
    try {
      const [pRes, tRes, dRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/tasks`),
        api.get(`/projects/${projectId}/dashboard`),
      ]);
      setProject(pRes.data.data);
      setTasks(tRes.data.data);
      setDashboard(dRes.data.data);
    } catch {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [projectId]);

  const handleStatusChange = async (taskId, newStatus) => {
    await api.patch(`/projects/${projectId}/tasks/${taskId}`, { status: newStatus });
    setTasks((prev) => prev.map((t) => t._id === taskId ? { ...t, status: newStatus } : t));
    // refresh dashboard counts
    const dRes = await api.get(`/projects/${projectId}/dashboard`);
    setDashboard(dRes.data.data);
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Delete this task?")) return;
    await api.delete(`/projects/${projectId}/tasks/${taskId}`);
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm("Remove this member?")) return;
    await api.delete(`/projects/${projectId}/members/${userId}`);
    setProject((prev) => ({ ...prev, members: prev.members.filter((m) => m.user._id !== userId) }));
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter.status && t.status !== filter.status) return false;
    if (filter.priority && t.priority !== filter.priority) return false;
    return true;
  });

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div className="page-loader"><div className="spinner spinner-lg" /></div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <button onClick={() => navigate("/")} style={{
            background: "none", color: "var(--text-muted)", fontSize: "13px",
            marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px",
          }}>← Back to projects</button>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 800 }}>
                  {project?.name}
                </h1>
                <span className={`badge badge-${myRole}`}>{myRole}</span>
              </div>
              {project?.description && (
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>{project.description}</p>
              )}
            </div>

            {isAdmin && (
              <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setTab("members"); setShowMemberModal(true); }}>
                  + Add Member
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setShowTaskModal(true)}>
                  + New Task
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Stats */}
        {dashboard && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "32px" }}>
            {[
              { label: "Total", value: dashboard.total, color: "var(--text)" },
              { label: "To Do", value: dashboard.todo, color: "var(--text-muted)" },
              { label: "In Progress", value: dashboard.inProgress, color: "var(--blue)" },
              { label: "Completed", value: dashboard.completed, color: "var(--green)" },
              { label: "Overdue", value: dashboard.overdue, color: "var(--red)" },
            ].map((s) => (
              <div key={s.label} className="card" style={{ padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: "24px", fontWeight: 800, fontFamily: "var(--font-display)", color: s.color }}>
                  {s.value}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "var(--bg-card)", padding: "4px", borderRadius: "var(--radius-sm)", width: "fit-content", border: "1px solid var(--border-subtle)" }}>
          {["tasks", "members"].map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "8px 20px", borderRadius: "6px", fontSize: "14px", fontWeight: 500,
              background: tab === t ? "var(--accent)" : "transparent",
              color: tab === t ? "#fff" : "var(--text-muted)",
              transition: "all 0.2s", textTransform: "capitalize",
            }}>{t}</button>
          ))}
        </div>

        {/* Tasks Tab */}
        {tab === "tasks" && (
          <div>
            {/* Filters */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
              <select className="input" style={{ width: "auto" }} value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
                <option value="">All Status</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <select className="input" style={{ width: "auto" }} value={filter.priority}
                onChange={(e) => setFilter({ ...filter, priority: e.target.value })}>
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              {(filter.status || filter.priority) && (
                <button className="btn btn-ghost btn-sm" onClick={() => setFilter({ status: "", priority: "" })}>
                  Clear filters
                </button>
              )}
            </div>

            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✅</div>
                <div className="empty-state-title">No tasks found</div>
                <p>{isAdmin ? "Create your first task to get started" : "No tasks match your filters"}</p>
                {isAdmin && (
                  <button className="btn btn-primary" style={{ marginTop: "20px" }} onClick={() => setShowTaskModal(true)}>
                    + New Task
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filteredTasks.map((task) => (
                  <TaskCard key={task._id} task={task} myRole={myRole}
                    onStatusChange={handleStatusChange} onDelete={handleDeleteTask} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {tab === "members" && (
          <div>
            {isAdmin && (
              <div style={{ marginBottom: "20px" }}>
                <button className="btn btn-primary btn-sm" onClick={() => setShowMemberModal(true)}>
                  + Add Member
                </button>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {project?.members?.map((m) => (
                <div key={m.user._id} className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      background: "var(--accent-dim)", border: "1px solid var(--accent)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "14px", fontWeight: 700, color: "var(--accent)",
                    }}>
                      {m.user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>@{m.user?.username}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{m.user?.email}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className={`badge badge-${m.role}`}>{m.role}</span>
                    {isAdmin && m.user._id !== user._id && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleRemoveMember(m.user._id)}>
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showTaskModal && (
        <CreateTaskModal
          projectId={projectId}
          members={project?.members}
          onClose={() => setShowTaskModal(false)}
          onCreated={(t) => { setTasks((prev) => [t, ...prev]); fetchAll(); }}
        />
      )}

      {showMemberModal && (
        <AddMemberModal
          projectId={projectId}
          onClose={() => setShowMemberModal(false)}
          onAdded={(updated) => setProject(updated)}
        />
      )}
    </div>
  );
}
