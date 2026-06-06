import { Link } from "react-router";

export default function Register() {
  return (
    <div className="size-full flex items-center justify-center bg-background">
      <div className="bg-white shadow-xl rounded-xl p-10 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🧸</span>
          <span className="font-semibold">Register Customer</span>
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg bg-white shadow hover:bg-gray-50"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
