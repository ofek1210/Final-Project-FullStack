import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { useAuth } from "../features/auth/AuthContext";

type ProfileForm = {
  fullName: string;
  email: string;
  avatarUrl: string;
  birthDate: string;
  gender: string;
  phone: string;
  city: string;
  bio: string;
};

export default function Dashboard() {
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [form, setForm] = useState<ProfileForm>({
    fullName: "",
    email: "",
    avatarUrl: "",
    birthDate: "",
    gender: "",
    phone: "",
    city: "",
    bio: "",
  });

  useEffect(() => {
    if (isEditing) return;
    setForm({
      fullName: user?.fullName ?? "",
      email: user?.email ?? "",
      avatarUrl: user?.avatarUrl ?? "",
      birthDate: user?.birthDate ?? "",
      gender: user?.gender ?? "",
      phone: user?.phone ?? "",
      city: user?.city ?? "",
      bio: user?.bio ?? "",
    });
  }, [user, isEditing]);

  const username = user?.username ?? "Unknown";
  const userId = user?.userId ?? "-";
  const displayName = user?.fullName?.trim() || username;

  // Fallback avatar
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    username
  )}&background=random&size=128`;
  const avatarPreview = (form.avatarUrl || user?.avatarUrl || "").trim() || avatarUrl;

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setNotice(null);

    try {
      await updateProfile({ ...form });
      setIsEditing(false);
      setNotice("הפרופיל עודכן בהצלחה");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שמירה נכשלה");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setIsEditing(false);
    setError(null);
    setNotice(null);
    setForm({
      fullName: user?.fullName ?? "",
      email: user?.email ?? "",
      avatarUrl: user?.avatarUrl ?? "",
      birthDate: user?.birthDate ?? "",
      gender: user?.gender ?? "",
      phone: user?.phone ?? "",
      city: user?.city ?? "",
      bio: user?.bio ?? "",
    });
  }

  const inputStyle: CSSProperties = {
    padding: "8px 10px",
    border: "1px solid #dcdcdc",
    borderRadius: 6,
    fontSize: 14,
  };

  const labelStyle: CSSProperties = {
    display: "grid",
    gap: 6,
  };

  const isReadOnly = !isEditing || isSaving;

  return (
    // Wrapper שמרכז את הכל באמצע המסך
    <div
      style={{
       position: "fixed",
       inset: 0,              // top:0 right:0 bottom:0 left:0
       display: "grid",
       placeItems: "center",
      }}
    >
      {/* הקונטיינר המקורי שלך */}
      <div
        style={{
           maxWidth: 700,
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
            border: "1px solid #e6e6e6",
            borderRadius: 8,
          }}
        >
          <img
            src={avatarPreview}
            alt="avatar"
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />

          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{displayName}</div>
            <div style={{ color: "#666" }}>@{username}</div>
            <div style={{ color: "#666" }}>ID: {userId}</div>
          </div>
        </div>

        <form
          onSubmit={handleSave}
          style={{
            display: "grid",
            gap: 12,
            padding: 16,
            border: "1px solid #e6e6e6",
            borderRadius: 8,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            <label style={labelStyle}>
              <span>שם מלא</span>
              <input
                style={inputStyle}
                value={form.fullName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, fullName: event.target.value }))
                }
                disabled={isReadOnly}
                placeholder="איך נעים לפנות אליך"
              />
            </label>

            <label style={labelStyle}>
              <span>אימייל</span>
              <input
                style={inputStyle}
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
                disabled={isReadOnly}
                placeholder="name@example.com"
              />
            </label>

            <label style={labelStyle}>
              <span>טלפון</span>
              <input
                style={inputStyle}
                value={form.phone}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, phone: event.target.value }))
                }
                disabled={isReadOnly}
                placeholder="050-0000000"
              />
            </label>

            <label style={labelStyle}>
              <span>עיר</span>
              <input
                style={inputStyle}
                value={form.city}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, city: event.target.value }))
                }
                disabled={isReadOnly}
                placeholder="לדוגמה: תל אביב"
              />
            </label>

            <label style={labelStyle}>
              <span>תאריך לידה</span>
              <input
                style={inputStyle}
                type="date"
                value={form.birthDate}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, birthDate: event.target.value }))
                }
                disabled={isReadOnly}
              />
            </label>

            <label style={labelStyle}>
              <span>מין</span>
              <select
                style={inputStyle}
                value={form.gender}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, gender: event.target.value }))
                }
                disabled={isReadOnly}
              >
                <option value="">בחר/י</option>
                <option value="female">נקבה</option>
                <option value="male">זכר</option>
                <option value="other">אחר</option>
                <option value="prefer_not_say">מעדיפ/ה לא לומר</option>
              </select>
            </label>
          </div>

          <label style={labelStyle}>
            <span>קישור לתמונה</span>
            <input
              style={inputStyle}
              value={form.avatarUrl}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, avatarUrl: event.target.value }))
              }
              disabled={isReadOnly}
              placeholder="https://..."
            />
          </label>

          <label style={labelStyle}>
            <span>אודות</span>
            <textarea
              style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
              value={form.bio}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, bio: event.target.value }))
              }
              disabled={isReadOnly}
              placeholder="כמה מילים עליך"
            />
          </label>

          {error && <div style={{ color: "crimson" }}>{error}</div>}
          {notice && <div style={{ color: "green" }}>{notice}</div>}

          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={logout}>
              התנתקות
            </button>
            {!isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setNotice(null);
                }}
              >
                עריכת פרופיל
              </button>
            )}
            {isEditing && (
              <>
                <button type="submit" disabled={isSaving}>
                  {isSaving ? "שומר..." : "שמירה"}
                </button>
                <button type="button" onClick={handleCancel} disabled={isSaving}>
                  ביטול
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
