import { Link } from "react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";

interface ValidationErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function Register() {
  const [lang, setLang] = useState<"en" | "vi">("vi");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const text = {
    en: {
      title: "Create Your Account",
      fullNameLabel: "Full Name",
      fullNamePlaceholder: "Enter your full name",
      emailPlaceholder: "Enter your email",
      phonePlaceholder: "Enter your phone number",
      passwordPlaceholder: "Enter your password",
      confirmPasswordPlaceholder: "Confirm your password",
      register: "Create Account",
      registering: "Creating Account...",
      titleLogin: "Already have an account?",
      login: "Sign In",
      validation: {
        fullNameRequired: "Full name is required",
        emailRequired: "Email is required",
        emailInvalid: "Please enter a valid email address",
        phoneRequired: "Phone number is required",
        passwordRequired: "Password is required",
        passwordMinLength: "Password must be at least 8 characters",
        confirmPasswordRequired: "Please confirm your password",
        confirmPasswordMismatch: "Passwords do not match",
      },
      successTitle: "Registration Successful",
      successText: "Your account has been created. Please sign in to continue.",
      errorTitle: "Registration Failed",
    },
    vi: {
      title: "Tạo tài khoản của bạn",
      fullNameLabel: "Họ và tên",
      fullNamePlaceholder: "Nhập họ và tên của bạn",
      emailPlaceholder: "Nhập email của bạn",
      phonePlaceholder: "Nhập số điện thoại của bạn",
      passwordPlaceholder: "Nhập mật khẩu của bạn",
      confirmPasswordPlaceholder: "Xác nhận mật khẩu của bạn",
      register: "Tạo tài khoản",
      registering: "Đang tạo tài khoản...",
      titleLogin: "Bạn đã có tài khoản?",
      login: "Đăng nhập",
      validation: {
        fullNameRequired: "Vui lòng nhập họ và tên",
        emailRequired: "Vui lòng nhập email",
        emailInvalid: "Vui lòng nhập email hợp lệ",
        phoneRequired: "Vui lòng nhập số điện thoại",
        passwordRequired: "Vui lòng nhập mật khẩu",
        passwordMinLength: "Mật khẩu phải có ít nhất 8 ký tự",
        confirmPasswordRequired: "Vui lòng xác nhận mật khẩu",
        confirmPasswordMismatch: "Mật khẩu xác nhận không khớp",
      },
      successTitle: "Đăng ký thành công",
      successText: "Tài khoản của bạn đã được tạo. Vui lòng đăng nhập để tiếp tục.",
      errorTitle: "Đăng ký thất bại",
    },
  };

  const t = text[lang];
  const v = text[lang].validation;

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = v.fullNameRequired;
    }

    if (!email.trim()) {
      newErrors.email = v.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = v.emailInvalid;
    }

    if (!phone.trim()) {
      newErrors.phone = v.phoneRequired;
    }

    if (!password.trim()) {
      newErrors.password = v.passwordRequired;
    } else if (password.length < 8) {
      newErrors.password = v.passwordMinLength;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = v.confirmPasswordRequired;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = v.confirmPasswordMismatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:3000/api/v1/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password: password,
            confirm_password: confirmPassword,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            (lang === "vi" ? "Đăng ký thất bại" : "Registration failed"),
        );
      }

      await Swal.fire({
        icon: "success",
        title: t.successTitle,
        text: t.successText,
        timer: 2000,
        showConfirmButton: false,
      });

      window.location.href = "/login";
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: t.errorTitle,
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
        <div className="space-y-5">
          {/* Logo */}
          <div className="flex justify-center">
            <img
              src="/src/app/assets/image/logo.jpg"
              alt="Logo"
              className="h-16 w-16 rounded-3xl object-cover"
              title="Logo: https://pin.it/5q6sXMHrf"
            />
          </div>

          {/* Title */}
          <div>
            <span className="font-bold text-lg">{t.title}</span>
          </div>

          {/* Full Name */}
          <div>
            <input
              className={`bg-neutral-secondary-medium border rounded-2xl border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body ${
                errors.fullName ? "border-red-500" : ""
              }`}
              type="text"
              placeholder={t.fullNamePlaceholder}
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) {
                  setErrors((prev) => ({ ...prev, fullName: undefined }));
                }
              }}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              className={`bg-neutral-secondary-medium border rounded-2xl border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body ${
                errors.email ? "border-red-500" : ""
              }`}
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <input
              className={`bg-neutral-secondary-medium border rounded-2xl border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body ${
                errors.phone ? "border-red-500" : ""
              }`}
              type="tel"
              placeholder={t.phonePlaceholder}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) {
                  setErrors((prev) => ({ ...prev, phone: undefined }));
                }
              }}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <input
              className={`bg-neutral-secondary-medium border rounded-2xl border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body ${
                errors.password ? "border-red-500" : ""
              }`}
              type={showPassword ? "text" : "password"}
              placeholder={t.passwordPlaceholder}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              className={`bg-neutral-secondary-medium border rounded-2xl border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body ${
                errors.confirmPassword ? "border-red-500" : ""
              }`}
              type={showConfirmPassword ? "text" : "password"}
              placeholder={t.confirmPasswordPlaceholder}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              disabled={loading}
              className="px-4 py-2 w-full rounded-lg bg-[#2d2d2d] text-white shadow hover:bg-primary-hover disabled:opacity-50"
              onClick={handleRegister}
            >
              {loading ? t.registering : t.register}
            </button>
          </div>

          <hr />

          {/* Login Link */}
          <div className="text-center">
            <Link to="/login">
              <p>
                <span> {t.titleLogin}</span>
                <span className="font-bold text-brand text-pink-500 cursor-pointer">
                  {" "}
                  {t.login}
                </span>
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}