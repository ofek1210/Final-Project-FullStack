import { useAuth } from "../features/auth/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{ maxWidth: 600, margin: "50px auto", display: "grid", gap: 10 }}>
      <h2>Dashboard</h2>
      <p>
        Welcome, <b>{user?.username}</b>
      </p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
