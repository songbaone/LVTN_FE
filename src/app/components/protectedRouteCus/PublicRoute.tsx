import { Navigate, Outlet } from "react-router";

export default function PublicRoute() {
  const token = localStorage.getItem("AccessToken");

  if (token) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
