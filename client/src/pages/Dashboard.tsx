import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import type { ProfileUpdate } from "../features/auth/auth.api";
import { useAuth } from "../features/auth/AuthContext";
import { fetchPosts, type Post } from "../features/posts/posts.api";

const MAX_AVATAR_BYTES = 3 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

export default function Dashboard() {
  const { user, logout, updateProfile } = useAuth();

  const username = user?.username ?? "Unknown";
  const userId = user?.userId ?? "-";
  const displayName = user?.fullName?.trim() ? user.fullName : username;

  // Fallback avatar
  const fallbackAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    username
  )}&background=random&size=128`;
  const avatarUrl = user?.avatarUrl?.trim() ? user.avatarUrl : fallbackAvatarUrl;

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | ""; message: string }>({
    type: "",
    message: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<ProfileUpdate>({
    username: user?.username ?? "",
  });
  const displayAvatarUrl = avatarPreviewUrl ?? avatarUrl;

  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [postsError, setPostsError] = useState("");
  const [isPostsLoading, setIsPostsLoading] = useState(false);

  useEffect(() => {
    setForm({
      username: user?.username ?? "",
    });
    setAvatarFile(null);
    setAvatarPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [user]);

  useEffect(() => {
    async function loadMyPosts() {
      if (!user?.userId) return;
      setIsPostsLoading(true);
      setPostsError("");
      try {
        const res = await fetchPosts({ mine: true, limit: 5, skip: 0 });
        setMyPosts(res.items);
      } catch (err: unknown) {
        setPostsError(getErrorMessage(err, "Failed to load posts"));
      } finally {
        setIsPostsLoading(false);
      }
    }

    void loadMyPosts();
  }, [user?.userId]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  function updateField<K extends keyof ProfileUpdate>(key: K, value: ProfileUpdate[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function clearAvatarSelection() {
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
    setAvatarFile(null);
    setAvatarPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
      setStatus({ type: "error", message: "Avatar must be JPG, PNG, or WEBP." });
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      setStatus({ type: "error", message: "Avatar must be 3MB or smaller." });
      event.target.value = "";
      return;
    }

    clearAvatarSelection();
    setStatus({ type: "", message: "" });
    setAvatarFile(file);
    setAvatarPreviewUrl(URL.createObjectURL(file));
  }

  function handleCancel() {
    setIsEditing(false);
    setStatus({ type: "", message: "" });
    clearAvatarSelection();
    setForm({
      username: user?.username ?? "",
    });
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    const trimmedUsername = form.username?.trim() ?? "";
    if (!trimmedUsername) {
      setStatus({ type: "error", message: "Username is required." });
      return;
    }

    setIsSaving(true);
    setStatus({ type: "", message: "" });

    try {
      await updateProfile(
        {
          username: trimmedUsername,
        },
        avatarFile
      );
      setIsEditing(false);
      clearAvatarSelection();
      setStatus({ type: "success", message: "Profile updated successfully." });
    } catch (err: unknown) {
      setStatus({ type: "error", message: getErrorMessage(err, "Failed to update profile.") });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      style={{
        width: "100%",
        display: "grid",
        gap: 12,
      }}
    >
        <h2>פרטי משתמש</h2>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: 16,
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 12,
            background: "rgba(11, 15, 26, 0.72)",
            boxShadow: "0 14px 30px rgba(0, 0, 0, 0.35)",
            backdropFilter: "blur(12px)",
          }}
        >
          <img
            src={displayAvatarUrl}
            alt="avatar"
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />

          <div style={{ display: "grid" }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{displayName}</div>
            <div style={{ color: "rgba(255, 255, 255, 0.7)" }}>@{username}</div>
            <div style={{ color: "rgba(255, 255, 255, 0.6)" }}>ID: {userId}</div>
          </div>
        </div>

        {isEditing && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
            <button type="button" onClick={() => fileInputRef.current?.click()}>
              החלף תמונה
            </button>
            {avatarFile && (
              <button type="button" onClick={clearAvatarSelection}>
                בטל
              </button>
            )}
            <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 12 }}>
              JPG/PNG/WEBP עד 3MB
            </span>
          </div>
        )}

        {!isEditing && (
          <div
            style={{
              display: "grid",
              gap: 6,
              padding: 16,
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 12,
              background: "rgba(11, 15, 26, 0.6)",
              boxShadow: "0 14px 30px rgba(0, 0, 0, 0.35)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div>
              <strong>Username:</strong> {user?.username || "—"}
            </div>
            {user?.email && (
              <div>
                <strong>Email:</strong> {user.email}
              </div>
            )}
          </div>
        )}

        {isEditing && (
          <form
            onSubmit={handleSave}
            style={{
              display: "grid",
              gap: 12,
              padding: 16,
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 12,
              background: "rgba(11, 15, 26, 0.6)",
              boxShadow: "0 14px 30px rgba(0, 0, 0, 0.35)",
              backdropFilter: "blur(12px)",
            }}
          >
            <label style={{ display: "grid", gap: 6 }}>
              Username
              <input
                value={form.username ?? ""}
                onChange={(e) => updateField("username", e.target.value)}
                placeholder="Username"
                style={{ padding: 8, borderRadius: 6, border: "1px solid #d0d0d0" }}
              />
            </label>

            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save changes"}
              </button>
              <button type="button" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {status.message && (
          <div style={{ color: status.type === "error" ? "#b42318" : "#027a48" }}>{status.message}</div>
        )}

        <div
          style={{
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 12,
            background: "rgba(11, 15, 26, 0.6)",
            boxShadow: "0 14px 30px rgba(0, 0, 0, 0.35)",
            backdropFilter: "blur(12px)",
            padding: 16,
            color: "#fff",
            display: "grid",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>My latest posts</strong>
            <Link to="/feed" style={{ color: "rgba(255,255,255,0.75)" }}>
              View all
            </Link>
          </div>

          {isPostsLoading && <div>Loading posts...</div>}
          {postsError && <div style={{ color: "#b42318" }}>{postsError}</div>}
          {!isPostsLoading && !postsError && myPosts.length === 0 && <div>No posts yet.</div>}

          {myPosts.map((post) => (
            <Link key={post.id} to={`/posts/${post.id}`} style={{ color: "#fff" }}>
              {post.text.length > 80 ? `${post.text.slice(0, 80)}...` : post.text}
            </Link>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={logout}>Logout</button>
          {!isEditing && (
            <button
              type="button"
              onClick={() => {
                setStatus({ type: "", message: "" });
                setIsEditing(true);
              }}
            >
              Edit Profile
            </button>
          )}
        </div>
    </div>
  );
}
