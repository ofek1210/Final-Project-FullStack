import { useAuth } from "../features/auth/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  const username = user?.username ?? "Unknown";
  const userId = user?.userId ?? "-";

  // Fallback avatar
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    username
  )}&background=random&size=128`;

  return (
  
    <div
      style={{
       position: "fixed",
       inset: 0,              
       display: "grid",
       placeItems: "center",
      }}
    >
      
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
            src={avatarUrl}
            alt="avatar"
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />

          <div style={{ display: "grid" }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{username}</div>
            <div style={{ color: "#666" }}>ID: {userId}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={logout}>Logout</button>
          <button
            onClick={() => {
              alert("Edit profile - not implemented yet");
            }}
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
