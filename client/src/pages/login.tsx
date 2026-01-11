import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import AuthShell from "../components/AuthShell";
import { useGoogleLogin } from "@react-oauth/google";

type GoogleProfile = { name?: string; email?: string; picture?: string };
type FacebookProfile = { id?: string; name?: string; email?: string; picture?: string };


declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

function loadFacebookSdk(appId: string, version = "v18.0") {
  return new Promise<void>((resolve, reject) => {
    if (window.FB) {
      resolve();
      return;
    }

    // Avoid injecting the script multiple times
    const existing = document.getElementById("facebook-jssdk");
    if (existing) {
      // if script exists but FB not yet ready, wait a bit
      const t = setInterval(() => {
        if (window.FB) {
          clearInterval(t);
          resolve();
        }
      }, 50);
      setTimeout(() => {
        clearInterval(t);
        if (!window.FB) reject(new Error("Facebook SDK not ready"));
      }, 8000);
      return;
    }

    window.fbAsyncInit = function () {
      try {
        window.FB.init({
          appId,
          cookie: true,
          xfbml: false,
          version,
        });
        resolve();
      } catch (e) {
        reject(e);
      }
    };

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.async = true;
    script.defer = true;
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.onerror = () => reject(new Error("Failed to load Facebook SDK"));
    document.body.appendChild(script);
  });
}

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const [googleProfile, setGoogleProfile] = useState<GoogleProfile | null>(null);
  const [facebookProfile, setFacebookProfile] = useState<FacebookProfile | null>(null);

  // ---- Google ----
  const hasGoogle = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  async function handleGoogleSuccess(response: any) {
    console.log("Full Google response:", response);

    if (response?.access_token) {
      try {
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${response.access_token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch user info");

        const profile = await res.json();
        setGoogleProfile({
          name: profile.name,
          email: profile.email,
          picture: profile.picture,
        });
        setMsg("Google sign-in successful.");
        return;
      } catch (err) {
        console.error("fetch userinfo failed", err);
        setMsg("Failed to fetch Google user info");
        return;
      }
    }

    setMsg("Google sign-in failed: no access token returned.");
  }

  const startGoogleLogin = hasGoogle
    ? useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => setMsg("Google sign-in failed"),
        flow: "implicit",
        scope: "openid profile email",
      })
    : () => setMsg("Google OAuth not configured (missing VITE_GOOGLE_CLIENT_ID)");

  // ---- Facebook ----

  const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID || import.meta.env.VITE_FACEBOOK_CLIENT_ID;
  const hasFacebook = Boolean(facebookAppId);

  // Preload SDK when appId exists (optional, but makes click faster)
  useEffect(() => {
    if (!hasFacebook) return;
    loadFacebookSdk(String(facebookAppId)).catch((e) => {
      console.error(e);
    });
  }, [hasFacebook, facebookAppId]);

  const startFacebookLogin = useMemo(() => {
    if (!hasFacebook) {
      return () => setMsg("Facebook OAuth not configured (missing VITE_FACEBOOK_APP_ID)");
    }

    return async () => {
      setMsg("");
      try {
        await loadFacebookSdk(String(facebookAppId));

        window.FB.login(
          (loginRes: any) => {
            console.log("FB.login response:", loginRes);

            if (!loginRes?.authResponse?.accessToken) {
              setMsg("Facebook sign-in failed or was cancelled.");
              return;
            }

            // Fetch profile via FB.api (cleaner than attaching token to URL)
            window.FB.api(
              "/me",
              { fields: "id,name,email,picture.width(200).height(200)" },
              (meRes: any) => {
                console.log("FB.api /me response:", meRes);

                if (meRes?.error) {
                  setMsg("Failed to fetch Facebook user info.");
                  return;
                }

                setFacebookProfile({
                  id: meRes?.id,
                  name: meRes?.name,
                  email: meRes?.email, // יכול להיות undefined אם לא קיים/לא מאושר
                  picture: meRes?.picture?.data?.url,
                });

                if (!meRes?.email) {
                  setMsg("Facebook login OK, but email not returned (permission not granted or no email on account).");
                } else {
                  setMsg("Facebook sign-in successful.");
                }
              }
            );
          },
          {
         
            scope: "public_profile,email",
            auth_type: "rerequest",
            return_scopes: true,
          }
        );
      } catch (err) {
        console.error("FB SDK load/login failed", err);
        setMsg("Facebook sign-in failed (could not load SDK).");
      }
    };
  }, [hasFacebook, facebookAppId]);

  // ---- Regular login ----
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    try {
      await login(username, password);
      nav("/dashboard");
    } catch (err: any) {
      setMsg(err?.message ?? "Login failed");
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

            <button
              type="button"
              className="neon-google-btn btn d-flex align-items-center"
              onClick={() => startFacebookLogin()}
              aria-label="Sign in with Facebook"
              disabled={!hasFacebook}
              title={!hasFacebook ? "Missing VITE_FACEBOOK_APP_ID" : undefined}
            >
              <img
                src="https://www.svgrepo.com/show/475647/facebook-color.svg"
                alt="Facebook"
                width={18}
                height={18}
                style={{ display: "block" }}
              />
              <span className="ms-2">Sign in with Facebook</span>
            </button>
          </div>
        </div>

        {googleProfile && (
          <div className="google-profile d-flex align-items-center gap-3 mt-3 p-2">
            <img src={googleProfile.picture} alt="avatar" width={56} height={56} className="rounded-circle" />
            <div>
              <div className="fw-semibold">{googleProfile.name}</div>
              <small className="text-white-50">{googleProfile.email}</small>
            </div>
          </div>
        )}

        {facebookProfile && (
          <div className="facebook-profile d-flex align-items-center gap-3 mt-3 p-2">
            <img src={facebookProfile.picture} alt="avatar" width={56} height={56} className="rounded-circle" />
            <div>
              <div className="fw-semibold">{facebookProfile.name}</div>
              <small className="text-white-50">{facebookProfile.email ?? "No email returned"}</small>
            </div>
          </div>
        )}

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
