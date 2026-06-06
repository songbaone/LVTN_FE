"use client";

import { useState } from "react";

export default function LoginAdmin() {
  const [lang, setLang] = useState<"en" | "vi">("en");

  const en = {
    title: "Admin Login",
    description: "Please sign in to continue managing your store.",
    emailLabel: "Email address",
    passwordLabel: "Password",
    emailPlaceholder: "your@email.com",
    passwordPlaceholder: "••••••••",
  };

  const vi = {
    title: "Đăng nhập quản trị",
    description: "Vui lòng đăng nhập để tiếp tục quản lý cửa hàng của bạn.",
    emailLabel: "Địa chỉ email",
    passwordLabel: "Mật khẩu",
    emailPlaceholder: "email@cua hang.com",
    passwordPlaceholder: "••••••••",
  };

  const switchLanguage = (newLang: "en" | "vi") => {
    setLang(newLang);
    if (newLang === "en") {
      console.log("Switched to English");
    } else {
      console.log("Switched to Vietnamese");
    }
  };

  return (
    <div className="px-4 py-8  flex flex-col items-center justify-center min-h-screen">
      <div className="absolute top-0 right-0 p-4">
        <button
          className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => switchLanguage("en")}
          title="Change language to English"
        >
          English
        </button>
        <button
          className="ml-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => switchLanguage("vi")}
          title="Chuyển đổi ngôn ngữ sang tiếng Việt"
        >
          Vietnamese
        </button>
      </div>
      <div className="logo flex-row space-y-2 shadow-lg p-15 rounded-lg bg-white">
        {lang === "en" ? (
          <div>
            <div className="flex items-center space-x-5 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="lucide lucide-baby size-8"
              >
                <path d="M9 12h.01"></path>
                <path d="M15 12h.01"></path>
                <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"></path>
                <path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"></path>
              </svg>
              <span>Admin Portal</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-4">
                Kids Store Management System
              </h1>
            </div>
            <div>
              <p className="text-gray-600">
                Please sign in to continue managing your store.
              </p>

              <form className="space-y-4 mt-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Please enter your email"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Please enter your password"
                  />
                </div>
                <div className="flex items-center justify-center gap-4">
                  <div>
                    <button
                      type="button"
                      className="  py-2 px-4 text-sm font-medium border border-transparent rounded-md shadow-sm text-blue-600 hover:text-blue-500"
                    >
                      Clear
                    </button>
                  </div>
                  <button
                    type="submit"
                    className=" py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Sign In
                  </button>
                </div>
              </form>

              <div className="note mt-5">
                <p className="text-sm text-gray-500 mt-4">
                  <span className="font-medium">Note:</span>{" "}
                  <span className="italic">
                    {" "}
                    Never share your login information with anyone else to
                    protect your account from unauthorized access.
                  </span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center space-x-5 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="lucide lucide-baby size-8"
              >
                <path d="M9 12h.01"></path>
                <path d="M15 12h.01"></path>
                <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"></path>
                <path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"></path>
              </svg>
              <span>Cổng thông tin quản trị</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-4">
                Hệ thống quản trị cửa hàng đồ trẻ em
              </h1>
            </div>
            <div>
              <p className="text-gray-600">
                Vui lòng đăng nhập để tiếp tục quản lý cửa hàng của bạn.
              </p>

              <form className="space-y-4 mt-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Địa chỉ email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Vui lòng nhập email của bạn"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Vui lòng nhập mật khẩu"
                  />
                </div>
                <div className="flex items-center justify-center gap-4">
                  <div>
                    <button
                      type="button"
                      className="  py-2 px-4 text-sm font-medium border border-transparent rounded-md shadow-sm text-blue-600 hover:text-blue-500"
                    >
                      Đặt lại
                    </button>
                  </div>
                  <button
                    type="submit"
                    className=" py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Đăng nhập
                  </button>
                </div>
              </form>

              <div className="note mt-5"></div>
              <p className="text-sm text-gray-500">
                <span className="font-medium"> Nhắc nhờ: </span>{" "}
                <span className="italic">
                  {" "}
                  Đừng bao giờ chia sẻ thông tin đăng nhập của bạn với người
                  khác để bảo vệ tài khoản của bạn khỏi truy cập trái phép.
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
