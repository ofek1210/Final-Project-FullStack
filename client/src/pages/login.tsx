import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import AuthShell from "../components/AuthShell";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    try {
      await login(username, password);
      nav("/dashboard");
    } catch (err: any) {
      setMsg(err.message);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue. Your session will be verified via /me."
    >
      <form onSubmit={handleSubmit} className="d-grid gap-3">
        <div>
          <label className="form-label text-white-50">Username</label>
          <div className="input-group">
            <span className="input-group-text bg-transparent text-white border-0">
              <i className="bi bi-person" />
            </span>
            <input
              className="form-control neon-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ofek"
              autoComplete="username"
            />
          </div>
        </div>

        <div>
          <label className="form-label text-white-50">Password</label>
          <div className="input-group">
            <span className="input-group-text bg-transparent text-white border-0">
              <i className="bi bi-key" />
            </span>
            <input
              type="password"
              className="form-control neon-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
        </div>

        <button className="btn neon-btn w-100 fw-semibold" type="submit">
          Login
        </button>

        {msg && (
          <div className="alert alert-danger mb-0 py-2">
            <small>{msg}</small>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center">
          <small className="text-white-50">No account?</small>
          <Link className="muted-link" to="/register">
            Create one
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
