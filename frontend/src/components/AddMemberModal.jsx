import { useState } from "react";
import api from "../api/axios";

export default function AddMemberModal({ projectId, onClose, onAdded }) {
  const [form, setForm] = useState({ email: "", role: "member" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.email.trim()) { setError("Email is required"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await api.post(`/projects/${projectId}/members`, form);
      onAdded(res.data.data);
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Add Member</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="form-group">
          <label className="form-label">User Email *</label>
          <input className="input" type="email" placeholder="member@example.com"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoFocus onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          <p style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "4px" }}>
            User must be registered on TaskFlow
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">Role</label>
          <select className="input" value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="member">Member — can update task status</option>
            <option value="admin">Admin — full project access</option>
          </select>
        </div>

        {error && <p className="form-error" style={{ marginBottom: "16px" }}>{error}</p>}

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner" /> : "Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
}
