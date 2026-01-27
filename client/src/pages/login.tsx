import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import AuthShell from "../components/AuthShell";
import { useGoogleLogin } from "@react-oauth/google";

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  // ---- Google ----
  const hasGoogle = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  async function handleGoogleSuccess(response: { access_token?: string }) {
    if (!response?.access_token) {
      setMsg("Google sign-in failed: no access token returned.");
      return;
    }

    try {
      await loginWithGoogle(response.access_token);
      nav("/dashboard");
    } catch (err: unknown) {
      setMsg(getErrorMessage(err, "Google sign-in failed"));
    }
  }

  const startGoogleLogin = hasGoogle
    ? useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => setMsg("Google sign-in failed"),
        flow: "implicit",
        scope: "openid profile email",
      })
    : () => setMsg("Google OAuth not configured (missing VITE_GOOGLE_CLIENT_ID)");

  // ---- Regular login ----
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg("");

    try {
      await login(username, password);
      nav("/dashboard");
    } catch (err: unknown) {
      setMsg(getErrorMessage(err, "Login failed"));
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue. Your session will be verified via /me.">
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
              placeholder="username"
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

        <div className="text-center mt-2">
          <small className="text-white-50 d-block mb-2">Or sign in with</small>

          <div className="d-flex justify-content-center gap-2 flex-wrap">
            <button
              type="button"
              className="neon-google-btn btn d-flex align-items-center"
              onClick={() => startGoogleLogin()}
              aria-label="Sign in with Google"
              disabled={!hasGoogle}
              title={!hasGoogle ? "Missing VITE_GOOGLE_CLIENT_ID" : undefined}
            >
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                alt="Google"
                width={18}
                height={18}
                style={{ display: "block" }}
              />
              <span className="ms-2">Sign in with Google</span>
            </button>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <small className="text-white-50">No account?</small>
          <Link className="muted-link" to="/register">
            Register here
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
