//Test 2

import { Link } from "react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useRef } from "react";
import Swal from "sweetalert2";
export default function Login() {
  const [lang, setLang] = useState<"en" | "vi">("vi");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const text = {
    en: {
      title: "Nice to see you again!",
      emailPlaceholder: "Enter your email",
      passwordPlaceholder: "Enter your password",
      login: "Sign In",
      loggingIn: "Signing In...",
      titleRegister: "Don't have an account?",
      register: "Get Started",
      forgotPassword: "Forgot password?",
      signInWith: "Or sign in with",
    },
    vi: {
      title: "Chào mừng bạn đến với cửa hàng của chúng tôi!",
      emailPlaceholder: "Nhập email của bạn",
      passwordPlaceholder: "Nhập mật khẩu của bạn",
      login: "Đăng nhập",
      loggingIn: "Đang đăng nhập...",
      titleRegister: "Bạn chưa có tài khoản?",
      register: "Đăng ký ngay",
      forgotPassword: "Quên mật khẩu?",
      signInWith: "Hoặc đăng nhập với",
    },
  };

  const handleGoogleCredential = async (response: any) => {
    try {
      const idToken = response.credential;

      console.log("Google ID Token:", idToken);

      const apiResponse = await fetch(
        "http://localhost:3000/api/v1/auth/google",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            id_token: idToken,
          }),
        },
      );

      const result = await apiResponse.json();
      console.log(result);
      if (result.error) {
        window.location.href = "/";
      } else {
        localStorage.setItem("AccessToken", result.data.access_token);

        await Swal.fire({
          icon: "success",
          title: lang === "vi" ? "Đăng nhập thành công" : "Login Successful",
          text: lang === "vi" ? "Chào mừng bạn quay trở lại!" : "Welcome back!",
          timer: 1500,
          showConfirmButton: false,
        });

        window.location.href = "/home";
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: lang === "vi" ? "Đăng nhập thất bại" : "Login Failed",
        text:
          error instanceof Error
            ? error.message
            : lang === "vi"
              ? "Có lỗi xảy ra"
              : "Something went wrong",
      });
    }
  };

  const handleLogin = async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      Swal.fire({
        icon: "warning",
        title: lang === "vi" ? "Thiếu thông tin" : "Missing Information",
        text:
          lang === "vi"
            ? "Vui lòng nhập email và mật khẩu"
            : "Please enter email and password",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:3000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            (lang === "vi" ? "Đăng nhập thất bại" : "Login failed"),
        );
      }

      // Lưu token
      localStorage.setItem("AccessToken", result.data.access_token);

      if (result.data.refresh_token) {
        localStorage.setItem("RefreshToken", result.data.refresh_token);
      }

      if (result.data.user) {
        localStorage.setItem("User", JSON.stringify(result.data.user));
      }

      await Swal.fire({
        icon: "success",
        title: lang === "vi" ? "Đăng nhập thành công" : "Login Successful",
        text: lang === "vi" ? "Chào mừng bạn quay trở lại!" : "Welcome back!",
        timer: 1500,
        showConfirmButton: false,
      });

      window.location.href = "/home";
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: lang === "vi" ? "Đăng nhập thất bại" : "Login Failed",
        text:
          error instanceof Error
            ? error.message
            : lang === "vi"
              ? "Có lỗi xảy ra"
              : "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          width: 300,
        });

        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="size-full flex items-center justify-center bg-background">
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
        <div className="space-y-6">
          {/* logo */}
          <div className="flex justify-center">
            <img
              src="/src/app/assets/image/logo.jpg"
              alt="Logo"
              className="h-16 w-16 rounded-3xl object-cover"
              title="Logo: https://pin.it/5q6sXMHrf"
            />
          </div>

          {/* title */}
          <div>
            <span className="font-bold text-lg">{text[lang].title}</span>
          </div>

          <div className="flex">
            <input
              className="bg-neutral-secondary-medium border rounded-2xl border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
              type="email"
              placeholder={text[lang].emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative ">
            <input
              className="bg-neutral-secondary-medium border rounded-2xl border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
              type={showPassword ? "text" : "password"}
              placeholder={text[lang].passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password">
              <p className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
                <span className="">{text[lang].forgotPassword}</span>
              </p>
            </Link>
          </div>

          <div className="flex justify-center">
            <button
              disabled={loading}
              className="px-4 py-2 w-full rounded-lg bg-[#2d2d2d] text-white shadow hover:bg-primary-hover disabled:opacity-50"
              onClick={() => handleLogin(email, password)}
            >
              {loading ? text[lang].loggingIn : text[lang].login}
            </button>
          </div>

          <div className="flex justify-center">
            <p className="text-sm text-gray-500">{text[lang].signInWith}</p>
          </div>

          <div className="flex justify-center gap-4">
            <div className="flex justify-center">
              <div ref={googleButtonRef}></div>
            </div>
          </div>

          <hr />

          <div className="text-center">
            <Link to="/register">
              <p>
                <span> {text[lang].titleRegister}</span>
                <span className="font-bold text-brand text-pink-500 cursor-pointer">
                  {" "}
                  {text[lang].register}
                </span>
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
