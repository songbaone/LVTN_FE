import { Outlet } from "react-router";

export default function AuthCustomerLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Left Side */}
      <div className="hidden w-1/2 bg-pink-100 md:flex">
        {/* Banner / Image */}
      </div>

      {/* Right Side */}
      <div className="flex items-center justify-center w-full md:w-1/2">
        <Outlet />
      </div>
    </div>
  );
}
