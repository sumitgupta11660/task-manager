import { useState } from "react";
import api from "../api/axios";

export default function CreateProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("Project name is required"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/projects", form);
      onCreated(res.data.data);
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">New Project</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="form-group">
          <label className="form-label">Project Name *</label>
          <input
            className="input"
            placeholder="e.g. Marketing Campaign"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="input"
            placeholder="What is this project about?"
            rows={3}
            style={{ resize: "none" }}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {error && <p className="form-error" style={{ marginBottom: "16px" }}>{error}</p>}

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner" /> : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
