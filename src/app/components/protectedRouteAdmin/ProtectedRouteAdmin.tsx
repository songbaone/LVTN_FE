import { Navigate, Outlet } from "react-router";

export default function ProtectedRouteAdmin() {
  const token = localStorage.getItem("AccessTokenAdmin");

  if (!token) {
    return <Navigate to="/admin-login" replace />;
  }

  return <Outlet />;
}
