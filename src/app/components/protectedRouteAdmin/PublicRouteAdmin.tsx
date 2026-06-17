import { Navigate, Outlet } from "react-router";

export default function PublicRouteAdmin() {
  const token = localStorage.getItem("AccessTokenAdmin");

  if (token) {
    return <Navigate to="/amdin" replace />;
  }

  return <Outlet />;
}
