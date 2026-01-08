import { useState } from "react";
import { useAuth } from "../features/auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    try {
      await register(username, password);
      nav("/dashboard");
    } catch (err: any) {
      setMsg(err.message);
    }
  }

  return (
    <AuthShell title="Create an account" subtitle="Sign up to get access.">
      <form onSubmit={handleSubmit} className="d-grid gap-3">
        <div>
          <label className="form-label text-white-50">Username</label>
          <input
            className="form-control neon-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete="username"
          />
        </div>

        <div>
          <label className="form-label text-white-50">Password</label>
          <input
            type="password"
            className="form-control neon-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="new-password"
          />
        </div>

        <button className="btn neon-btn w-100 fw-semibold" type="submit">Create account</button>

        {msg && (
          <div className="alert alert-danger mb-0 py-2">
            <small>{msg}</small>
          </div>
        )}

        <div className="d-flex justify-content-center mt-2">
          <Link className="muted-link" to="/login">Already have an account? Login</Link>
        </div>
      </form>
    </AuthShell>
  );
}
