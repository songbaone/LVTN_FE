import { Navigate, Outlet } from "react-router";

export default function ProtectedRoute() {
  const token = localStorage.getItem("AccessToken");

  if (!token && token != "") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
