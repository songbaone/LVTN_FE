"use client";

import { useState } from "react";
import { useNavigate } from "react-router";

export default function LoginAdmin() {
  const navigate = useNavigate();

  const [lang, setLang] = useState<"en" | "vi">("vi");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const text = {
    en: {
      portal: "Admin Portal",
      title: "Kids Store Management System",
      description: "Please sign in to continue managing your store.",
      email: "Email Address",
      password: "Password",
      emailPlaceholder: "Enter your email",
      passwordPlaceholder: "Enter your password",
      login: "Sign In",
      loggingIn: "Signing In...",
      clear: "Clear",
      note: "Never share your login information with anyone else.",
      required: "Please enter email and password",
    },
    vi: {
      portal: "Cổng thông tin quản trị",
      title: "Hệ thống quản trị cửa hàng đồ trẻ em",
      description: "Vui lòng đăng nhập để tiếp tục quản lý cửa hàng.",
      email: "Địa chỉ email",
      password: "Mật khẩu",
      emailPlaceholder: "Vui lòng nhập email",
      passwordPlaceholder: "Vui lòng nhập mật khẩu",
      login: "Đăng nhập",
      loggingIn: "Đang đăng nhập...",
      clear: "Đặt lại",
      note: "Đừng bao giờ chia sẻ thông tin đăng nhập với người khác để bảo vệ tài khoản.",
      required: "Vui lòng nhập email và mật khẩu",
    },
  };

  const t = text[lang];

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert(t.required);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:3000/api/admin/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/admin");
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-slate-100 px-4">
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => setLang("en")}
          className={`px-3 py-2 rounded-md border ${
            lang === "en" ? "bg-blue-600 text-white" : "bg-white"
          }`}
        >
          English
        </button>

        <button
          onClick={() => setLang("vi")}
          className={`px-3 py-2 rounded-md border ${
            lang === "vi" ? "bg-blue-600 text-white" : "bg-white"
          }`}
        >
          Tiếng Việt
        </button>
      </div>

      <div className="bg-white shadow-xl rounded-xl p-10 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🧸</span>
          <span className="font-semibold">{t.portal}</span>
        </div>

        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>

        <p className="text-gray-600 mb-6">{t.description}</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">{t.email}</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              {t.password}
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordPlaceholder}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 text-blue-600"
            >
              {t.clear}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-5 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? t.loggingIn : t.login}
            </button>
          </div>
        </form>

        <p className="text-sm text-gray-500 italic mt-6">{t.note}</p>
      </div>
    </div>
  );
}
