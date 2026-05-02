import { useState } from "react";
import api from "../api/axios";

export default function CreateTaskModal({ projectId, members, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: "", description: "", priority: "medium",
    assignedTo: "", dueDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError("Task title is required"); return; }
    setLoading(true);
    setError("");
    try {
      const payload = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        assignedTo: form.assignedTo || undefined,
        dueDate: form.dueDate || undefined,
      };
      const res = await api.post(`/projects/${projectId}/tasks`, payload);
      onCreated(res.data.data);
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">New Task</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="form-group">
          <label className="form-label">Title *</label>
          <input className="input" placeholder="Task title" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="input" placeholder="Task details..." rows={2}
            style={{ resize: "none" }} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="input" value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input className="input" type="date" value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Assign To</label>
          <select className="input" value={form.assignedTo}
            onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
            <option value="">Unassigned</option>
            {members?.map((m) => (
              <option key={m.user._id} value={m.user._id}>
                @{m.user.username}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="form-error" style={{ marginBottom: "16px" }}>{error}</p>}

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner" /> : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
