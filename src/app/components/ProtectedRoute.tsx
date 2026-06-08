import { Navigate, Outlet } from "react-router";

export default function ProtectedRoute() {
  const token = localStorage.getItem("AccessToken");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
