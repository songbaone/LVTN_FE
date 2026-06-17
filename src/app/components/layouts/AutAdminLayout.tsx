import { Outlet } from "react-router";

export default function AuthAdminLayout() {
  return (
    <div className="flex min-h-screen">
      <div className="flex items-center justify-center w-full ">
        <Outlet />
      </div>
    </div>
  );
}
