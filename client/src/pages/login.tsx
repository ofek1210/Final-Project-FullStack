import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import AuthShell from "../components/AuthShell";
import { useGoogleLogin } from "@react-oauth/google";


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

  // Google OAuth success handler (client-side only; backend exchange not implemented)
  function handleGoogleSuccess(response: any) {
    // response.credential contains the JWT from Google
    if (!response?.credential) {
      setMsg("Google sign-in failed: no credential returned");
      return;
    }

    console.log("Google credential:", response.credential);
    setMsg("Google sign-in successful (not wired to backend yet)");
    // TODO: send response.credential to your backend to exchange for an app session token
  }

  // Use Google login hook only if provider is configured; otherwise fallback to a noop that reports misconfiguration
  const hasGoogle = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const startGoogleLogin = hasGoogle
    ? useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => setMsg("Google sign-in failed"),
      })
    : () => setMsg("Google OAuth not configured");

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
          <div className="d-flex justify-content-center">
            {hasGoogle ? (
              <button
                type="button"
                className="neon-google-btn btn d-flex align-items-center"
                onClick={() => startGoogleLogin()}
                aria-label="Sign in with Google"
              >
                <svg viewBox="0 0 533.5 544.3" width="18" height="18" aria-hidden="true" focusable="false">
                  <path fill="#4285F4" d="M533.5 278.4c0-18.8-1.6-37-4.6-54.6H272v103.2h147.1c-6.4 34.6-25.4 63.9-54.1 83.5v69.4h87.3c51.1-47 82.2-116.3 82.2-201.5z"/>
                  <path fill="#34A853" d="M272 544.3c73.6 0 135.5-24.4 180.6-66.3l-87.3-69.4c-24.3 16.3-55.3 25.9-93.3 25.9-71.7 0-132.5-48.3-154.2-113.3H29.1v71.4C74.1 485.6 167.5 544.3 272 544.3z"/>
                  <path fill="#FBBC05" d="M117.8 326.2c-10.6-31.6-10.6-65.6 0-97.2V157.6H29.1c-41.7 81.4-41.7 177.4 0 258.9l88.7-71.4z"/>
                  <path fill="#EA4335" d="M272 107.7c39.6 0 75.2 13.6 103.1 40.6l77.3-77.3C407.7 25 345.8 0 272 0 167.5 0 74.1 58.7 29.1 148.9l88.7 71.4C139.5 156 200.3 107.7 272 107.7z"/>
                </svg>
                <span className="ms-2">Sign in with Google</span>
              </button>
            ) : (
              <button
                type="button"
                className="neon-google-btn btn d-flex align-items-center"
                disabled
                title="Google OAuth not configured"
              >
                <svg viewBox="0 0 533.5 544.3" width="18" height="18" aria-hidden="true" focusable="false">
                  <path fill="#4285F4" d="M533.5 278.4c0-18.8-1.6-37-4.6-54.6H272v103.2h147.1c-6.4 34.6-25.4 63.9-54.1 83.5v69.4h87.3c51.1-47 82.2-116.3 82.2-201.5z"/>
                  <path fill="#34A853" d="M272 544.3c73.6 0 135.5-24.4 180.6-66.3l-87.3-69.4c-24.3 16.3-55.3 25.9-93.3 25.9-71.7 0-132.5-48.3-154.2-113.3H29.1v71.4C74.1 485.6 167.5 544.3 272 544.3z"/>
                  <path fill="#FBBC05" d="M117.8 326.2c-10.6-31.6-10.6-65.6 0-97.2V157.6H29.1c-41.7 81.4-41.7 177.4 0 258.9l88.7-71.4z"/>
                  <path fill="#EA4335" d="M272 107.7c39.6 0 75.2 13.6 103.1 40.6l77.3-77.3C407.7 25 345.8 0 272 0 167.5 0 74.1 58.7 29.1 148.9l88.7 71.4C139.5 156 200.3 107.7 272 107.7z"/>
                </svg>
                <span className="ms-2">Sign in with Google</span>
              </button>
            )}
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
