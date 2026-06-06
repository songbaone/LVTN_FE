import { Link } from "react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
export default function Login() {
  const [lang, setLang] = useState<"en" | "vi">("vi");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    },
  };

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
              className="px-4 py-2 w-full rounded-lg bg-[#2d2d2d] text-white shadow hover:bg-primary-hover"
              onClick={() => {
                setLoading(true);
                setTimeout(() => {
                  setLoading(false);
                }, 2000);
              }}
            >
              {loading ? text[lang].loggingIn : text[lang].login}
            </button>
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
