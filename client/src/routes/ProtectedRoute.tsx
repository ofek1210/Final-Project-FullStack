import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthed } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthed) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
